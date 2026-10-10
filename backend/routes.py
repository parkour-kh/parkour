import hmac
import os
import re

import requests
from flask import Blueprint, jsonify, request

import gemini_client
import store
from recommend import VALID_USER_TYPES, recommend

bp = Blueprint("api", __name__, url_prefix="/api")



def body():
    return request.get_json(silent=True) or {}


def error(message, status=400):
    return jsonify(error=message), status

GOOGLE_BASE = "https://places.googleapis.com/v1"
UCF_LAT, UCF_LNG = 28.6024, -81.2001

REPORT_CATEGORIES = ("blocked_space", "broken_light", "broken_sign", "debris", "violation", "other")


def sensor_authorized():
    """If SENSOR_TOKEN is set in .env, changing a spot's OPEN/TAKEN status requires the
    matching X-Sensor-Token header (the Pi bridge sends it). If it's not set, anyone can."""
    token = os.getenv("SENSOR_TOKEN")
    if not token:
        return True
    return hmac.compare_digest(request.headers.get("X-Sensor-Token", ""), token)


# ---------- legacy: keeps the old "Entrance count" page working ----------
@bp.get("/count")
def get_count():
    return jsonify(count=store.taken_count())


# ---------- read-only data ----------
@bp.get("/destinations")
def destinations():
    return jsonify(store.destinations())


@bp.get("/garages")
def garages():
    return jsonify(store.garages_summary())


@bp.get("/garages/<garage_id>")
def garage_detail(garage_id):
    floors = store.garage_spots(garage_id)
    if floors is None:
        return error("garage not found", 404)
    return jsonify(garage=garage_id, floors=floors)


# ---------- recommendation ----------
@bp.post("/recommend")
def recommend_route():
    b = body()
    if not b.get("destination") or not b.get("user_type"):
        return error("destination and user_type are required")
    try:
        result = recommend(
            store.snapshot(), b["destination"], b["user_type"],
            accessible=bool(b.get("accessible", False)),
            time_str=b.get("time"),
            large_vehicle=bool(b.get("large_vehicle", False)),
        )
    except ValueError as e:
        return error(str(e))
    return jsonify(result)


# ---------- sensor / bridge / crowd feedback ----------
@bp.post("/spots/<spot_id>")
def update_spot(spot_id):
    b = body()
    status = b.get("status")
    if status is not None:
        status = str(status).upper()
        if status not in ("OPEN", "TAKEN"):
            return error("status must be OPEN or TAKEN")
    narrow = b.get("narrow")
    if narrow is not None and not isinstance(narrow, bool):
        return error("narrow must be true or false")
    if status is None and narrow is None:
        return error("send status and/or narrow")
    if status is not None and not sensor_authorized():
        return error("bad or missing X-Sensor-Token", 401)
    spot = store.update_spot(spot_id, status=status, narrow=narrow)
    if spot is None:
        return error("spot not found", 404)
    return jsonify(spot)


# ---------- save my spot / find my car ----------
@bp.post("/save-spot")
def save_spot():
    b = body()
    if not b.get("spot_id"):
        return error("spot_id is required")
    saved = store.save_car(b.get("user_id", "demo"), b["spot_id"])
    if saved is None:
        return error("spot not found", 404)
    return jsonify(saved), 201


@bp.get("/my-car")
def my_car():
    car = store.get_car(request.args.get("user_id", "demo"))
    if car is None:
        return error("no saved spot", 404)
    return jsonify(car)


# ---------- issue reports ----------
@bp.post("/reports")
def create_report():
    b = body()
    category = b.get("category")
    if category not in REPORT_CATEGORIES:
        return error(f"category must be one of {list(REPORT_CATEGORIES)}")
    report = store.add_report(category, b.get("description", ""), b.get("garage"), b.get("floor"))
    return jsonify(report), 201


@bp.get("/reports")
def list_reports():
    return jsonify(store.list_reports())


# ---------- destination search (Google Places) ----------
def places_headers(field_mask):
    return {
        "X-Goog-Api-Key": os.getenv("GOOGLE_PLACES_API_KEY", ""),
        "X-Goog-FieldMask": field_mask,
        "Content-Type": "application/json",
    }


@bp.post("/places/autocomplete")
def places_autocomplete():
    b = body()
    query = (b.get("query") or "").strip()
    if len(query) < 2 or len(query) > 150:
        return error("query must be 2-150 characters")
    try:
        r = requests.post(
            f"{GOOGLE_BASE}/places:autocomplete",
            headers=places_headers(
                "suggestions.placePrediction.placeId,"
                "suggestions.placePrediction.structuredFormat"),
            json={
                "input": query,
                "sessionToken": b.get("session_token", ""),
                "locationBias": {"circle": {
                    "center": {"latitude": UCF_LAT, "longitude": UCF_LNG},
                    "radius": 10000.0}},
                "regionCode": "us",
            },
            timeout=8,
        )
        r.raise_for_status()
    except requests.RequestException as e:
        detail = getattr(getattr(e, "response", None), "text", "")[:500]
        print("Places autocomplete failed:", e, detail)
        return error("Places unavailable", 502)

    out = []
    for s in r.json().get("suggestions", []):
        p = s.get("placePrediction")
        if not p:
            continue
        f = p.get("structuredFormat", {})
        out.append({
            "place_id": p.get("placeId"),
            "name": f.get("mainText", {}).get("text", ""),
            "address": f.get("secondaryText", {}).get("text", ""),
        })
    return jsonify(predictions=out)


@bp.post("/places/details")
def places_details():
    b = body()
    place_id = b.get("place_id", "")
    if not re.fullmatch(r"[A-Za-z0-9_-]+", place_id):
        return error("invalid place_id")
    try:
        r = requests.get(
            f"{GOOGLE_BASE}/places/{place_id}",
            headers=places_headers("id,displayName,formattedAddress,location"),
            params={"sessionToken": b.get("session_token", "")},
            timeout=8,
        )
        r.raise_for_status()
    except requests.RequestException as e:
        detail = getattr(getattr(e, "response", None), "text", "")[:500]
        print("Places details failed:", e, detail)
        return error("Places unavailable", 502)

    d = r.json()
    loc = d.get("location", {})
    if "latitude" not in loc or "longitude" not in loc:
        return error("Google did not return coordinates", 502)
    return jsonify(
        place_id=d.get("id"),
        name=d.get("displayName", {}).get("text", ""),
        address=d.get("formattedAddress", ""),
        latitude=loc["latitude"],
        longitude=loc["longitude"],
    )


# ---------- Gemini assistant ----------
@bp.post("/chat")
def chat():
    b = body()
    message = (b.get("message") or "").strip()
    if not message:
        return error("message is required")
    if len(message) > 500:
        return error("message too long (500 characters max)")
    user_type = b.get("user_type", "student")
    if user_type not in VALID_USER_TYPES:
        return error(f"user_type must be one of {VALID_USER_TYPES}")

    data = store.snapshot()
    dest_id, parsed_by_ai = gemini_client.parse_destination(message, data["destinations"])
    if dest_id is None:
        names = ", ".join(d["name"] for d in data["destinations"])
        return jsonify(destination=None, recommendation=None, ai_used=parsed_by_ai,
                       reply=f"I couldn't tell which building you're headed to. I know: {names}.")

    result = recommend(data, dest_id, user_type,
                       accessible=bool(b.get("accessible", False)),
                       time_str=b.get("time"),
                       large_vehicle=bool(b.get("large_vehicle", False)))
    reply, explained_by_ai = gemini_client.explain(message, result)
    return jsonify(destination=dest_id, recommendation=result, reply=reply,
                   ai_used=parsed_by_ai or explained_by_ai)

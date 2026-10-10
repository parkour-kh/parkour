import hmac
import os
import re

import requests
from flask import Blueprint, jsonify, request

import gemini_client
import store
from recommend import VALID_USER_TYPES, recommend

bp = Blueprint("api", __name__, url_prefix="/api")

GOOGLE_BASE = "https://places.googleapis.com/v1"
UCF_LAT, UCF_LNG = 28.6024, -81.2001

REPORT_CATEGORIES = ("blocked_space", "broken_light", "broken_sign", "debris", "violation", "other")
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
        print("Places autocomplete failed:", e)
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
        print("Places details failed:", e)
        return error("Places unavailable", 502)

    d = r.json()
    loc = d.get("location", {})
    return jsonify(
        place_id=d.get("id"),
        name=d.get("displayName", {}).get("text", ""),
        address=d.get("formattedAddress", ""),
        latitude=loc.get("latitude"),
        longitude=loc.get("longitude"),
    )

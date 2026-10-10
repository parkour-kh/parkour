from flask import Blueprint, jsonify, request

import store
from recommend import recommend

bp = Blueprint("api", __name__, url_prefix="/api")

REPORT_CATEGORIES = ("blocked_space", "broken_light", "broken_sign", "debris", "violation", "other")


def error(message, status=400):
    return jsonify(error=message), status


def body():
    return request.get_json(silent=True) or {}


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


# ---------- Gemini (Phase 4) ----------
@bp.post("/chat")
def chat():
    return error("chat is not implemented yet", 501)

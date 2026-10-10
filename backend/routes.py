from flask import Blueprint, jsonify, request

bp = Blueprint("api", __name__, url_prefix="/api")

count = 0


@bp.get("/count")
def get_count():
    return jsonify(count=count)


@bp.post("/count")
def update_count():
    global count
    count = int(request.get_json(force=True).get("count", count))
    return jsonify(count=count)

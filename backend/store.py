"""In-memory data store, loaded once from data/parking.json.

Everything resets when the server restarts. That's fine for a hackathon demo;
swap this file for SQLite later without touching routes.py.
"""
import copy
import json
import threading
from datetime import datetime, timezone
from pathlib import Path

DATA_PATH = Path(__file__).parent / "data" / "parking.json"

_lock = threading.RLock()  # Flask's dev server is threaded
_data = {}
_spots = {}        # spot id -> spot dict
_reports = []
_saved_cars = {}   # user_id -> saved spot info


def load():
    """(Re)load sample data from disk."""
    global _data, _spots
    with _lock:
        with open(DATA_PATH) as f:
            _data = json.load(f)
        _spots = {s["id"]: s for s in _data["spots"]}
        _reports.clear()
        _saved_cars.clear()


def now_iso():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


# ---------- reads ----------
def snapshot():
    """Deep copy of everything the recommender needs."""
    with _lock:
        return copy.deepcopy(_data)


def destinations():
    with _lock:
        return [{"id": d["id"], "name": d["name"],
                 "latitude": d.get("latitude"), "longitude": d.get("longitude")}
                for d in _data["destinations"]]


def garages_summary():
    """Garages with OPEN/TAKEN counts per floor."""
    with _lock:
        out = []
        for g in _data["garages"]:
            floors = {}
            for s in _data["spots"]:
                if s["garage"] != g["id"]:
                    continue
                f = floors.setdefault(s["floor"], {"floor": s["floor"], "open": 0, "taken": 0})
                f["open" if s["status"] == "OPEN" else "taken"] += 1
            floor_list = [floors[k] for k in sorted(floors)]
            out.append({
                "id": g["id"], "name": g["name"],
                "latitude": g.get("latitude"), "longitude": g.get("longitude"),
                "permits": g.get("permits", []), "capacity": g.get("capacity"),
                "floors": floor_list,
                "open": sum(f["open"] for f in floor_list),
                "taken": sum(f["taken"] for f in floor_list),
            })
        return out


def garage_spots(garage_id):
    """All spots in one garage, grouped by floor (feeds the map screen)."""
    with _lock:
        spots = [dict(s) for s in _data["spots"] if s["garage"] == garage_id]
        if not spots:
            return None
        floors = {}
        for s in spots:
            floors.setdefault(s["floor"], []).append(s)
        return [{"floor": k, "spots": floors[k]} for k in sorted(floors)]


def taken_count():
    with _lock:
        return sum(1 for s in _spots.values() if s["status"] == "TAKEN")


# ---------- writes ----------
def update_spot(spot_id, status=None, narrow=None):
    with _lock:
        spot = _spots.get(spot_id)
        if spot is None:
            return None
        if status is not None:
            spot["status"] = status
        if narrow is not None:
            spot["narrow"] = narrow
        return dict(spot)


def save_car(user_id, spot_id):
    with _lock:
        spot = _spots.get(spot_id)
        if spot is None:
            return None
        info = {"spot_id": spot_id, "garage": spot["garage"], "floor": spot["floor"],
                "near": spot["near"], "saved_at": now_iso()}
        _saved_cars[user_id] = info
        return dict(info)


def get_car(user_id):
    with _lock:
        info = _saved_cars.get(user_id)
        return dict(info) if info else None


def add_report(category, description, garage=None, floor=None):
    with _lock:
        report = {"id": len(_reports) + 1, "category": category, "description": description,
                  "garage": garage, "floor": floor, "created_at": now_iso(), "status": "open"}
        _reports.append(report)
        return dict(report)


def list_reports():
    with _lock:
        return [dict(r) for r in reversed(_reports)]  # newest first


load()

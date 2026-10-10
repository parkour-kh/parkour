
from datetime import datetime, timezone

# DEMO DATA ONLY — not live UCF parking availability.
GARAGES = {
    "A": {
        "name": "Garage A",
        "floors": {
            "1": [
                {"id": "A-1-01", "status": "OPEN", "narrow": False},
                {"id": "A-1-02", "status": "TAKEN", "narrow": False},
                {"id": "A-1-03", "status": "OPEN", "narrow": True},
            ],
            "2": [
                {"id": "A-2-01", "status": "OPEN", "narrow": False},
                {"id": "A-2-02", "status": "TAKEN", "narrow": False},
            ],
        },
    },
    "B": {
        "name": "Garage B",
        "floors": {
            "1": [
                {"id": "B-1-01", "status": "OPEN", "narrow": False},
                {"id": "B-1-02", "status": "OPEN", "narrow": False},
            ],
            "2": [
                {"id": "B-2-01", "status": "TAKEN", "narrow": False},
                {"id": "B-2-02", "status": "OPEN", "narrow": True},
            ],
        },
    },
}

DESTINATIONS = [
    {"id": "student_union", "name": "Student Union"},
    {"id": "library", "name": "John C. Hitt Library"},
    {"id": "engineering", "name": "Engineering Building"},
]

SAVED_CARS = {}
REPORTS = []


def destinations():
    return DESTINATIONS


def garage_spots(garage_id):
    garage = GARAGES.get(garage_id.upper())
    if garage is None:
        return None
    return garage["floors"]


def garages_summary():
    result = []
    for garage_id, garage in GARAGES.items():
        spots = [
            spot
            for floor in garage["floors"].values()
            for spot in floor
        ]
        available = sum(
            spot["status"] == "OPEN" for spot in spots
        )
        result.append({
            "id": garage_id,
            "name": garage["name"],
            "available": available,
            "total": len(spots),
        })
    return result


def snapshot():
    return {
        "garages": GARAGES,
        "destinations": DESTINATIONS,
    }


def taken_count():
    return sum(
        spot["status"] == "TAKEN"
        for garage in GARAGES.values()
        for floor in garage["floors"].values()
        for spot in floor
    )


def find_spot(spot_id):
    for garage_id, garage in GARAGES.items():
        for floor_id, spots in garage["floors"].items():
            for spot in spots:
                if spot["id"] == spot_id:
                    return {
                        **spot,
                        "garage": garage_id,
                        "floor": floor_id,
                    }
    return None


def update_spot(spot_id, status=None, narrow=None):
    for garage in GARAGES.values():
        for spots in garage["floors"].values():
            for spot in spots:
                if spot["id"] == spot_id:
                    if status is not None:
                        spot["status"] = status
                    if narrow is not None:
                        spot["narrow"] = narrow
                    return spot.copy()
    return None


def save_car(user_id, spot_id):
    spot = find_spot(spot_id)
    if spot is None:
        return None
    SAVED_CARS[user_id] = spot.copy()
    return SAVED_CARS[user_id]


def get_car(user_id):
    return SAVED_CARS.get(user_id)


def add_report(category, description="", garage=None, floor=None):
    report = {
        "id": len(REPORTS) + 1,
        "category": category,
        "description": description,
        "garage": garage,
        "floor": floor,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    REPORTS.append(report)
    return report


def list_reports():
    return REPORTS


"""Regenerates data/parking.json so it matches the phone app (src/data/parking.ts).

Run from the backend folder:   python make_sample_data.py

All values are SAMPLE data. Walk times are estimated from the coordinates in
parking.ts (straight-line distance x 1.3 detour factor at ~80 m/min), not measured.
Spot counts are generated so each garage's capacity and OPEN count match what the app shows today.
"""
import json
import math
import random
from pathlib import Path

CAMPUS_CENTER = (28.6024, -81.2001)
EXIT_OFFSET_DEG = 0.0006   # ~65 m: how far the two exits sit from the garage center
METERS_PER_MIN = 80
DETOUR = 1.3

# Keep these IDs identical to DESTINATIONS in src/data/parking.ts
DESTINATIONS = [
    ("library", "John C. Hitt Library", 28.6005, -81.2004),
    ("student-union", "Student Union", 28.6017, -81.2002),
    ("engineering", "Engineering Building", 28.6014, -81.1984),
    ("cb1", "Classroom Building I", 28.6002, -81.1991),
    ("cb2", "Classroom Building II", 28.5998, -81.1986),
    ("arena", "Addition Financial Arena", 28.6071, -81.1972),
    # these two exist in the search box (CampusDestinationSearch.tsx) but not in parking.ts
    ("millican", "Millican Hall", 28.5991, -81.2008),
    ("rec", "Recreation and Wellness Center", 28.5965, -81.1987),
]

# Keep these IDs identical to GARAGES in src/data/parking.ts
# (id, name, lat, lng, permits, floors, spots_per_floor, open_now)
GARAGES = [
    ("a", "Garage A", 28.6000, -81.2034, ["Student", "Employee"], 3, 40, 35),
    ("b", "Garage B", 28.6030, -81.2025, ["Student", "Employee"], 3, 50, 18),
    ("c", "Garage C", 28.6042, -81.1988, ["Student", "Employee"], 3, 60, 42),
    ("d", "Garage D", 28.5990, -81.1975, ["Employee"], 4, 25, 24),
]


def meters(a, b):
    """Approximate distance in meters between two (lat, lng) points."""
    dlat = (a[0] - b[0]) * 111_320
    dlng = (a[1] - b[1]) * 111_320 * math.cos(math.radians(a[0]))
    return math.hypot(dlat, dlng)


def walk_minutes(a, b):
    return max(1.0, round(meters(a, b) * DETOUR / METERS_PER_MIN * 2) / 2)  # nearest 0.5 min


def toward(frm, to, deg):
    """Point `deg` degrees away from `frm` in the direction of `to`."""
    dlat, dlng = to[0] - frm[0], to[1] - frm[1]
    norm = math.hypot(dlat, dlng) or 1
    return (frm[0] + dlat / norm * deg, frm[1] + dlng / norm * deg)


def build(seed):
    random.seed(seed)
    garages, spots, exit_points = [], [], {}

    for gid, name, lat, lng, permits, floors, per_floor, open_now in GARAGES:
        center = (lat, lng)
        exits = [
            {"id": f"{gid}-exit-1", "kind": "exit", "label": "Campus-side exit"},
            {"id": f"{gid}-exit-2", "kind": "exit", "label": "Outer exit"},
            {"id": f"{gid}-elev", "kind": "elevator", "label": "Elevator"},
        ]
        exit_points[exits[0]["id"]] = toward(center, CAMPUS_CENTER, EXIT_OFFSET_DEG)
        exit_points[exits[1]["id"]] = toward(center, CAMPUS_CENTER, -EXIT_OFFSET_DEG)
        exit_points[exits[2]["id"]] = center

        garage_spots = []
        for floor in range(1, floors + 1):
            for i in range(per_floor):
                f = i / per_floor
                general = "employee" if permits == ["Employee"] else "student"
                if f >= 0.90:
                    typ, near = "accessible", exits[2]["id"]
                elif f < 0.40:
                    typ, near = general, exits[1]["id"]      # students park near the OUTER exit
                elif f < 0.70:
                    typ, near = "employee", exits[0]["id"]   # employees near the campus-side exit
                else:
                    typ, near = general, exits[1]["id"]
                garage_spots.append({
                    "id": f"{gid}-{floor}-{i + 1:02d}", "garage": gid, "floor": floor,
                    "type": typ, "status": "TAKEN", "near": near,
                    "narrow": typ != "accessible" and i % 7 == 3,
                })

        # exactly `open_now` spots are OPEN, so counts match the app's current numbers
        for s in random.sample(garage_spots, open_now):
            s["status"] = "OPEN"

        garages.append({"id": gid, "name": name, "latitude": lat, "longitude": lng,
                        "permits": permits, "capacity": len(garage_spots), "exits": exits})
        spots.extend(garage_spots)

    destinations = [{
        "id": did, "name": dname, "latitude": dlat, "longitude": dlng,
        "walk": {eid: walk_minutes(pt, (dlat, dlng)) for eid, pt in exit_points.items()},
    } for did, dname, dlat, dlng in DESTINATIONS]

    return {"garages": garages, "destinations": destinations, "spots": spots}


def demo_friendly(data):
    """Every garage needs OPEN spots of each kind so the demo always has something to show."""
    for g in data["garages"]:
        open_types = {s["type"] for s in data["spots"] if s["garage"] == g["id"] and s["status"] == "OPEN"}
        needed = {"employee", "accessible"} | ({"student"} if "Student" in g["permits"] else set())
        if not needed <= open_types:
            return False
    return True


if __name__ == "__main__":
    seed = 1
    data = build(seed)
    while not demo_friendly(data):
        seed += 1
        data = build(seed)
    out = Path(__file__).parent / "data" / "parking.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(data, indent=1))
    print(f"wrote {out} (seed {seed}): {len(data['spots'])} spots")

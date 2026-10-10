"""Recommendation logic: pure Python, no AI.

Order of operations (same as the team plan):
  1. Keep only spaces the user is LEGALLY allowed to use right now.
  2. Score what's left (walk time, accessibility, vehicle fit, availability).
  3. Return garages ranked best-first, each with its single best spot.
Gemini only ever sees this output -- it never decides the answer.
"""
from datetime import datetime

AFTER_HOURS_MINUTES = 17 * 60 + 30   # 5:30 p.m.
VALID_USER_TYPES = ("student", "employee")


def to_minutes(time_str=None):
    """'17:45' -> 1065. No argument = current local time."""
    if time_str:
        hh, mm = time_str.split(":")
        return int(hh) * 60 + int(mm)
    now = datetime.now()
    return now.hour * 60 + now.minute


def allowed_types(user_type, accessible, minutes):
    """Which spot types this user may use at this time of day."""
    types = {user_type}
    if user_type == "student" and minutes >= AFTER_HOURS_MINUTES:
        types.add("employee")          # the 5:30 p.m. rule
    if accessible:
        types.add("accessible")
    return types


def walk_minutes(spot, dest_walk, exits_by_id):
    """Walk from the spot's nearest exit/elevator to the destination."""
    walk = dest_walk[spot["near"]]
    if exits_by_id[spot["near"]]["kind"] != "elevator":
        walk += (spot["floor"] - 1) * 0.5   # stairs cost a little time on upper floors
    return walk


def score_spot(spot, walk, accessible, large_vehicle, exits_by_id):
    points = 100 - walk * 4
    reasons = [f"about {walk:g} min walk to your destination"]
    if accessible and spot["type"] == "accessible":
        points += 15
        reasons.append("accessible space")
    if accessible and exits_by_id[spot["near"]]["kind"] == "elevator":
        points += 8
        reasons.append("next to an elevator")
    if large_vehicle and spot["narrow"]:
        points -= 20
        reasons.append("flagged narrow (penalized for larger vehicles)")
    return points, reasons


def recommend(data, destination_id, user_type, accessible=False, time_str=None, large_vehicle=False):
    dest = next((d for d in data["destinations"] if d["id"] == destination_id), None)
    if dest is None:
        raise ValueError(f"unknown destination '{destination_id}'")
    if user_type not in VALID_USER_TYPES:
        raise ValueError(f"user_type must be one of {VALID_USER_TYPES}")

    minutes = to_minutes(time_str)
    types = allowed_types(user_type, accessible, minutes)
    after_hours_rule = user_type == "student" and minutes >= AFTER_HOURS_MINUTES

    ranked, full = [], []
    for g in data["garages"]:
        exits_by_id = {e["id"]: e for e in g["exits"]}
        eligible = [s for s in data["spots"]
                    if s["garage"] == g["id"] and s["status"] == "OPEN" and s["type"] in types]
        if not eligible:
            full.append({"garage_id": g["id"], "garage_name": g["name"]})
            continue

        best = None
        for s in eligible:
            walk = walk_minutes(s, dest["walk"], exits_by_id)
            points, reasons = score_spot(s, walk, accessible, large_vehicle, exits_by_id)
            if best is None or points > best["points"]:
                best = {"spot": s, "walk": walk, "points": points, "reasons": reasons}

        spot = best["spot"]
        reasons = list(best["reasons"])
        reasons.append(f"{len(eligible)} eligible spaces open in this garage")
        if after_hours_rule and spot["type"] == "employee":
            reasons.append("after 5:30 p.m. students may use employee spaces")
        ranked.append({
            "garage_id": g["id"], "garage_name": g["name"],
            "floor": spot["floor"], "spot_id": spot["id"], "spot_type": spot["type"],
            "near": spot["near"], "near_label": exits_by_id[spot["near"]]["label"],
            "walk_minutes": best["walk"], "open_eligible": len(eligible),
            "score": round(best["points"] + min(len(eligible), 10), 1),  # small availability bonus
            "reasons": reasons,
        })

    ranked.sort(key=lambda r: r["score"], reverse=True)
    for i, r in enumerate(ranked, start=1):
        r["rank"] = i
    return {"destination": dest["name"], "user_type": user_type, "accessible": accessible,
            "time_used": f"{minutes // 60:02d}:{minutes % 60:02d}",
            "results": ranked, "full_garages": full}

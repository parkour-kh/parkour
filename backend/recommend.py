
# Demo parking recommendation logic.
# Does not use live UCF parking availability.

DESTINATION_GARAGES = {
    "student_union": ["A", "B"],
    "library": ["A", "B"],
    "engineering": ["B", "A"],
}


def recommend(
    snapshot,
    destination,
    user_type,
    accessible=False,
    time_str=None,
    large_vehicle=False,
):
    garages = snapshot["garages"]

    valid_destinations = {
        item["id"] for item in snapshot["destinations"]
    }

    if destination not in valid_destinations:
        raise ValueError("Unknown destination")

    if not isinstance(user_type, str) or not user_type.strip():
        raise ValueError("Invalid user type")

    preferred_garages = DESTINATION_GARAGES.get(
        destination, list(garages.keys())
    )

    recommendations = []

    for garage_id in preferred_garages:
        garage = garages.get(garage_id)
        if garage is None:
            continue

        available_spots = []

        for floor_id, spots in garage["floors"].items():
            for spot in spots:
                if spot["status"] != "OPEN":
                    continue

                if large_vehicle and spot["narrow"]:
                    continue

                available_spots.append({
                    "spot_id": spot["id"],
                    "floor": floor_id,
                })

        if available_spots:
            recommendations.append({
                "garage_id": garage_id,
                "garage_name": garage["name"],
                "available": len(available_spots),
                "suggested_spot": available_spots[0],
            })

    return {
        "destination": destination,
        "user_type": user_type,
        "accessible": accessible,
        "recommendations": recommendations,
        "data_source": "demo",
    }

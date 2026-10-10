"""Makes the demo lot look alive: flips random spots OPEN/TAKEN every few seconds.

Run it next to the server (any computer that can reach the API):

    python simulate.py                                  # local server, one flip every 3 s
    python simulate.py --api http://192.168.1.23:5000 --interval 2 --flips 2

It talks to the API the same way the Arduino bridge and the camera do, and it never touches
the "live" spots (the ones real hardware controls), so it can't fight them.
The token comes from SENSOR_TOKEN in backend/.env (or --token).
"""
import argparse
import os
import random
import time

import requests
from dotenv import load_dotenv

load_dotenv()

# Spots driven by real hardware. The simulator never changes these.
CAMERA_SPOTS = ["a-1-01", "a-1-02", "a-1-04", "a-1-05"]   # Pi camera
SENSOR_SPOTS = ["a-1-03"]                                  # Arduino ultrasonic sensor


def fetch_spots(api):
    """Returns {spot_id: status} for every spot on the server."""
    spots = {}
    for g in requests.get(f"{api}/api/garages", timeout=5).json():
        detail = requests.get(f"{api}/api/garages/{g['id']}", timeout=5).json()
        for floor in detail["floors"]:
            for s in floor["spots"]:
                spots[s["id"]] = s["status"]
    return spots


def post_status(api, token, spot_id, status):
    headers = {"X-Sensor-Token": token} if token else {}
    r = requests.post(f"{api}/api/spots/{spot_id}", json={"status": status}, headers=headers, timeout=5)
    r.raise_for_status()


def pick_flip(statuses, live, rng=random):
    """Choose one non-live spot. Returns (spot_id, new_status), or None if there is nothing to flip."""
    candidates = [sid for sid in statuses if sid not in live]
    if not candidates:
        return None
    sid = rng.choice(candidates)
    return sid, ("OPEN" if statuses[sid] == "TAKEN" else "TAKEN")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default=os.getenv("API_URL", "http://localhost:5000"))
    ap.add_argument("--token", default=os.getenv("SENSOR_TOKEN", ""))
    ap.add_argument("--interval", type=float, default=3.0, help="seconds between rounds")
    ap.add_argument("--flips", type=int, default=1, help="spots to flip each round")
    ap.add_argument("--keep-camera", action="store_true",
                    help="don't reset the camera spots to OPEN at the start")
    args = ap.parse_args()
    api = args.api.rstrip("/")
    live = set(CAMERA_SPOTS) | set(SENSOR_SPOTS)

    try:
        statuses = fetch_spots(api)
    except requests.RequestException as e:
        raise SystemExit(f"Could not reach {api}. Is app.py running? ({e})")

    missing = sorted(live - set(statuses))
    if missing:
        print("Warning: these live spots are not in the server's data:", ", ".join(missing))

    if not args.keep_camera:   # start the demo with the camera spots empty
        for sid in CAMERA_SPOTS:
            try:
                post_status(api, args.token, sid, "OPEN")
            except requests.RequestException as e:
                print(f"Could not reset {sid}:", e)

    simulated = len(set(statuses) - live)
    print(f"Simulating {simulated} spots on {api} every {args.interval:g}s "
          f"(leaving {len(live)} live spots alone). Ctrl+C to stop.")
    try:
        while True:
            for _ in range(args.flips):
                flip = pick_flip(statuses, live)
                if flip is None:
                    break
                sid, status = flip
                try:
                    post_status(api, args.token, sid, status)
                    statuses[sid] = status
                    print(f"{sid} -> {status}")
                except requests.RequestException as e:
                    print("POST failed (will keep going):", e)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        print("stopped")


if __name__ == "__main__":
    main()

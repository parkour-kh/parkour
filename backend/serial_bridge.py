"""Runs on the Raspberry Pi (or any computer the Arduino is plugged into over USB).

Reads lines like   a-1-03,TAKEN   from the Arduino and forwards each CHANGE to the Flask API.

    python serial_bridge.py --port /dev/ttyACM0 --api http://localhost:5000
    python serial_bridge.py --port COM3 --api https://your-server.example.com     (Windows)

Find the port: Arduino IDE -> Tools -> Port. On a Pi: `ls /dev/ttyACM* /dev/ttyUSB*`.
The token comes from SENSOR_TOKEN in backend/.env (or --token).
"""
import argparse
import os
import time

import requests
import serial
from dotenv import load_dotenv

load_dotenv()


STATUS_WORDS = {"OPEN": "OPEN", "AVAILABLE": "OPEN", "TAKEN": "TAKEN", "OCCUPIED": "TAKEN"}


def parse_line(line, default_spot=None):
    """'a-1-03,TAKEN' -> ('a-1-03', 'TAKEN'). Returns None for anything else (boot messages, noise).

    With default_spot set, a sensor that sends no spot id also works: a bare 'TAKEN'/'OPEN',
    or 'SPOT_A1:OCCUPIED'/'SPOT_A1:AVAILABLE', is reported for default_spot.
    """
    text = line.strip()
    if "," in text:
        spot_id, _, word = text.partition(",")
    elif default_spot and ":" in text:
        spot_id, word = default_spot, text.partition(":")[2]
    elif default_spot:
        spot_id, word = default_spot, text
    else:
        return None
    spot_id, status = spot_id.strip(), STATUS_WORDS.get(word.strip().upper())
    if not spot_id or status is None:
        return None
    return spot_id, status


def post_status(api, token, spot_id, status):
    headers = {"X-Sensor-Token": token} if token else {}
    r = requests.post(f"{api}/api/spots/{spot_id}", json={"status": status}, headers=headers, timeout=5)
    r.raise_for_status()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", default=os.getenv("SERIAL_PORT", "/dev/ttyACM0"))
    ap.add_argument("--baud", type=int, default=9600)
    ap.add_argument("--api", default=os.getenv("API_URL", "http://localhost:5000"))
    ap.add_argument("--token", default=os.getenv("SENSOR_TOKEN", ""))
    ap.add_argument("--spot", default=os.getenv("SPOT_ID", ""),
                    help="spot id to use when the sensor prints only TAKEN/OPEN, e.g. a-1-03")
    ap.add_argument("--debug", action="store_true", help="print every raw line received from the sensor")
    args = ap.parse_args()

    last = {}  # spot_id -> last status we sent, so we only POST changes
    print(f"Reading {args.port} @ {args.baud}, posting to {args.api}")
    with serial.Serial(args.port, args.baud, timeout=1) as ser:
        time.sleep(2)  # the Arduino resets when the port opens
        silent_reads = 0
        while True:
            raw = ser.readline().decode("utf-8", errors="ignore")
            parsed = parse_line(raw, args.spot or None)
            if args.debug:
                if raw.strip():
                    silent_reads = 0
                    print("got:", repr(raw.strip()), "->", parsed if parsed else "IGNORED (format not recognised)")
                else:
                    silent_reads += 1
                    if silent_reads % 5 == 0:
                        print(f"...no data from {args.port} for {silent_reads}s (is the sketch running on this port?)")
            if parsed is None:
                continue
            spot_id, status = parsed
            if last.get(spot_id) == status:
                continue
            try:
                post_status(args.api, args.token, spot_id, status)
                last[spot_id] = status
                print(f"{spot_id} -> {status}")
            except requests.RequestException as e:
                print("POST failed (will retry on the next reading):", e)


if __name__ == "__main__":
    main()

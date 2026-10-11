"""Runs on the Raspberry Pi (or any computer the Arduino is plugged into over USB).

Reads lines like   a-1-03,TAKEN   from the Arduino and forwards each CHANGE to the Flask API.

    python serial_bridge.py --port auto --api http://localhost:5000          (finds the Arduino itself)
    python serial_bridge.py --port /dev/ttyACM0 --api http://localhost:5000
    python serial_bridge.py --port COM3 --api https://your-server.example.com     (Windows)

--port auto (the default) picks the USB serial device that looks like an Arduino/CH340, so a
changing COM number doesn't matter. If the Arduino is unplugged, it keeps trying until it's back.
The token comes from SENSOR_TOKEN in backend/.env (or --token).
"""
import argparse
import os
import time

import requests
import serial
import serial.tools.list_ports
from dotenv import load_dotenv

load_dotenv()


STATUS_WORDS = {"OPEN": "OPEN", "AVAILABLE": "OPEN", "TAKEN": "TAKEN", "OCCUPIED": "TAKEN"}

# USB vendor ids of common Arduino-style boards/chips: CH340, Arduino, CP210x, FTDI
ARDUINO_VIDS = {0x1A86, 0x2341, 0x2A03, 0x10C4, 0x0403}
ARDUINO_WORDS = ("ch340", "arduino", "usb-serial", "usb serial", "cp210", "ftdi", "redboard", "ttyusb", "ttyacm")


def find_arduino_port():
    """Returns the device name (COM11, /dev/ttyUSB0...) of the first Arduino-like port, or None."""
    for p in serial.tools.list_ports.comports():
        text = f"{p.device} {p.description} {p.manufacturer} {p.hwid}".lower()
        if "bthenum" in text or "bluetooth" in text:
            continue                      # Windows lists many Bluetooth 'serial' ports; skip them
        if p.vid in ARDUINO_VIDS or any(w in text for w in ARDUINO_WORDS):
            return p.device
    return None


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


def read_port(port, args, last):
    """Open `port` and forward changes until the connection drops (raises SerialException)."""
    print(f"Reading {port} @ {args.baud}, posting to {args.api}")
    with serial.Serial(port, args.baud, timeout=1) as ser:
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
                        print(f"...no data from {port} for {silent_reads}s (is the sketch running on this port?)")
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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", default=os.getenv("SERIAL_PORT", "auto"),
                    help="COM port / device, or 'auto' to find the Arduino (default)")
    ap.add_argument("--baud", type=int, default=9600)
    ap.add_argument("--api", default=os.getenv("API_URL", "http://localhost:5000"))
    ap.add_argument("--token", default=os.getenv("SENSOR_TOKEN", ""))
    ap.add_argument("--spot", default=os.getenv("SPOT_ID", ""),
                    help="spot id to use when the sensor prints only TAKEN/OPEN, e.g. a-1-03")
    ap.add_argument("--debug", action="store_true", help="print every raw line received from the sensor")
    args = ap.parse_args()

    last = {}  # spot_id -> last status we sent, so we only POST changes
    waiting_msg_shown = False
    while True:
        port = find_arduino_port() if args.port.lower() == "auto" else args.port
        if port is None:
            if not waiting_msg_shown:
                print("No Arduino found on USB. Plug it in (and close the Arduino Serial Monitor)...")
                waiting_msg_shown = True
            time.sleep(2)
            continue
        waiting_msg_shown = False
        try:
            read_port(port, args, last)
        except (serial.SerialException, OSError) as e:
            print(f"Lost {port}: {e}. Reconnecting in 3 seconds...")
            time.sleep(3)
        except KeyboardInterrupt:
            print("stopped")
            return


if __name__ == "__main__":
    main()

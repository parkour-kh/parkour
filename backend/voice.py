"""ElevenLabs text-to-speech integration for Parkour's Flask backend.

Mount in backend/routes.py on the backend branch:
    from voice import generate_voice
    @bp.post("/voice")
    def voice():
        return generate_voice()

Requires ELEVENLABS_API_KEY in Render environment. Do not commit keys.
"""
import os
import time
from collections import defaultdict, deque
from threading import Lock
import urllib.error
import urllib.request

from flask import Response, jsonify, request

DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"
_RATE_WINDOW = 60
_RATE_MAX = 5
_requests = defaultdict(deque)
_rate_lock = Lock()


def within_rate_limit(client):
    now = time.monotonic()
    with _rate_lock:
        timestamps = _requests[client]
        while timestamps and now - timestamps[0] > _RATE_WINDOW:
            timestamps.popleft()
        if len(timestamps) >= _RATE_MAX:
            return False
        timestamps.append(now)
        return True


def generate_voice():
    data = request.get_json(silent=True) or {}
    text = data.get("text")
    if not isinstance(text, str) or not text.strip() or len(text) > 1500:
        return jsonify(error="Text must be between 1 and 1500 characters"), 400

    if not within_rate_limit(request.remote_addr or "unknown"):
        return jsonify(error="Too many voice requests; try again in a minute"), 429

    api_key = os.environ.get("ELEVENLABS_API_KEY")
    if not api_key:
        return jsonify(error="Voice service is not configured"), 503

    import json

    voice_id = os.environ.get("ELEVENLABS_VOICE_ID", DEFAULT_VOICE_ID)
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    payload = json.dumps({
        "text": text.strip(),
        "model_id": "eleven_multilingual_v2",
    }).encode("utf-8")
    upstream_request = urllib.request.Request(
        url,
        data=payload,
        headers={
            "xi-api-key": api_key,
            "Content-Type": "application/json",
            "Accept": "audio/mpeg",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(upstream_request, timeout=20) as upstream:
            audio = upstream.read()
        return Response(audio, mimetype="audio/mpeg", headers={"Cache-Control": "no-store"})
    except (urllib.error.URLError, TimeoutError) as exc:
        print("ElevenLabs voice request failed:", type(exc).__name__)
        return jsonify(error="Voice generation is unavailable"), 502

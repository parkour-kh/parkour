"""ElevenLabs text-to-speech integration for Parkour's Flask backend.

Mount in backend/routes.py on the backend branch:
    from voice import generate_voice
    @bp.post("/voice")
    def voice():
        return generate_voice()

Requires ELEVENLABS_API_KEY in Render environment. Do not commit keys.
"""
import os
import urllib.error
import urllib.request

from flask import Response, jsonify, request

DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"


def generate_voice():
    data = request.get_json(silent=True) or {}
    text = data.get("text")
    if not isinstance(text, str) or not text.strip() or len(text) > 1500:
        return jsonify(error="Text must be between 1 and 1500 characters"), 400

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

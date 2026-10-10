# ElevenLabs speech endpoint. Key stays on the server.
import os
import requests
from flask import Blueprint, jsonify, request, Response

voice_bp = Blueprint("voice", __name__, url_prefix="/api")

@voice_bp.post("/voice")
def voice():
    payload = request.get_json(silent=True) or {}
    text = payload.get("text", "")
    if not isinstance(text, str) or not text.strip() or len(text) > 1500:
        return jsonify(error="Text must contain 1-1500 characters"), 400
    key = os.getenv("ELEVENLABS_API_KEY")
    if not key:
        return jsonify(error="ElevenLabs is not configured on the server"), 503
    voice_id = os.getenv("ELEVENLABS_VOICE_ID", "JBFqnCBsd6RMkjVDRZzb")
    model = os.getenv("ELEVENLABS_MODEL_ID", "eleven_multilingual_v2")
    try:
        upstream = requests.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={"xi-api-key": key, "Content-Type": "application/json", "Accept": "audio/mpeg"},
            params={"output_format": "mp3_44100_128"},
            json={"text": text.strip(), "model_id": model},
            timeout=45,
        )
    except requests.RequestException:
        return jsonify(error="Speech provider could not be reached"), 502
    if not upstream.ok:
        return jsonify(error="Speech provider rejected the request", provider_status=upstream.status_code), 502
    if not upstream.content or not upstream.headers.get("Content-Type", "").startswith("audio/"):
        return jsonify(error="Speech provider returned no audio"), 502
    return Response(upstream.content, mimetype="audio/mpeg", headers={"Cache-Control": "no-store"})

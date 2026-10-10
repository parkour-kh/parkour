"""Limited, authenticated ElevenLabs TTS endpoint for private demos.

A shared token embedded in a distributed mobile app is not secure authentication.
Before public release, use per-user authentication and rate limiting.
"""
import hmac
import os

import requests
from flask import Blueprint, Response, jsonify, request

voice_bp = Blueprint('voice', __name__)

@voice_bp.post('/api/voice')
def synthesize_voice():
    expected = os.getenv('PARKOUR_VOICE_TOKEN', '')
    supplied = request.headers.get('X-Parkour-Voice-Token', '')
    if not expected or not hmac.compare_digest(supplied, expected):
        return jsonify(error='Voice authentication required'), 401

    payload = request.get_json(silent=True) or {}
    text = payload.get('text', '')
    if not isinstance(text, str) or not 0 < len(text.strip()) <= 300:
        return jsonify(error='text must be 1 to 300 characters'), 400

    api_key = os.getenv('ELEVENLABS_API_KEY')
    voice_id = os.getenv('ELEVENLABS_VOICE_ID')
    model_id = os.getenv('ELEVENLABS_MODEL_ID', 'eleven_multilingual_v2')
    if not api_key or not voice_id:
        return jsonify(error='Voice service is not configured'), 503

    try:
        result = requests.post(
            f'https://api.elevenlabs.io/v1/text-to-speech/{voice_id}',
            headers={'xi-api-key': api_key, 'Accept': 'audio/mpeg'},
            json={'text': text.strip(), 'model_id': model_id},
            timeout=25,
        )
    except requests.RequestException:
        return jsonify(error='Voice provider unavailable'), 502

    if not result.ok:
        print('ElevenLabs request failed: HTTP', result.status_code, flush=True)
        return jsonify(error='Voice provider rejected request', provider_status=result.status_code), 502

    return Response(result.content, mimetype='audio/mpeg', headers={'Cache-Control': 'no-store'})

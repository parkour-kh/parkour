
import os

from flask import Blueprint, jsonify, request
from google import genai

chat_bp = Blueprint("chat", __name__, url_prefix="/api")


@chat_bp.post("/chat")
def chat():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")

    if not isinstance(message, str) or not message.strip():
        return jsonify(error="Please enter a message."), 400

    if len(message) > 2000:
        return jsonify(error="Message is too long."), 400

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return jsonify(error="Gemini API key is not configured."), 503

    try:
        client = genai.Client(api_key=api_key)

        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-2.5-flash"),
            contents=message,
            config={
                "system_instruction": (
                    "You are Parkour's friendly parking assistance chatbot "
                    "for students at the University of Central Florida. "
                    "Help with parking questions, finding garages, "
                    "remembering parking locations, and accessibility. "
                    "Keep answers clear, helpful, and concise. "
                    "Do not invent live parking availability, campus "
                    "regulations, prices, or accessibility information. "
                    "If information needs verification, direct users to "
                    "official UCF Parking and Transportation resources. "
                    "For emergencies, tell users to contact 911."
                )
            },
        )

        answer = response.text or "I couldn't generate a response."

        return jsonify(reply=answer)

    except Exception as exc:
        print("Gemini chatbot error:", type(exc).__name__, str(exc))
        return jsonify(error="AI assistance is temporarily unavailable."), 502

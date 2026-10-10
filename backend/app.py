from dotenv import load_dotenv
from flask import Flask
 
load_dotenv()  # reads backend/.env (put GEMINI_API_KEY there; never commit it)
 
from routes import bp  # noqa: E402  (after load_dotenv so later modules see the env vars)
 
app = Flask(__name__, static_folder="dashboard", static_url_path="")
app.register_blueprint(bp)
import os
from flask import jsonify, request

@app.before_request
def protect_demo_api():
    if os.getenv("PARKOUR_PUBLIC_DEMO") == "1":
        allowed = (
            request.method == "GET"
            and request.path in (
                "/api/count",
                "/api/destinations",
                "/api/garages",
            )
        ) or (
            request.method == "GET"
            and request.path.startswith("/api/garages/")
        ) or (
            request.method == "POST"
            and request.path == "/api/recommend"
        )

        if request.path.startswith("/api/") and not allowed:
            return jsonify(error="Unavailable in public demo mode"), 403
 
if __name__ == "__main__":
    # host="0.0.0.0" lets a phone/laptop on the same Wi-Fi reach the Pi. debug=True is for local dev only.
    app.run(host="0.0.0.0", port=5000, debug=True)
 

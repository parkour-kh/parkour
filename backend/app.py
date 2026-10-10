import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

load_dotenv()  # reads backend/.env (GEMINI_API_KEY, SENSOR_TOKEN...; never commit it)

from routes import bp  # noqa: E402  (after load_dotenv so later modules see the env vars)

app = Flask(__name__, static_folder="dashboard", static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})  # lets Expo web (a browser) call this API
app.register_blueprint(bp)

if __name__ == "__main__":
    # host="0.0.0.0" lets a phone/laptop on the same Wi-Fi reach this machine.
    # debug=True is for local dev only -- use gunicorn when deploying (see README).
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)

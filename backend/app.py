import os
from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

load_dotenv()

from routes import bp  # noqa: E402
from voice import voice_bp  # noqa: E402

app = Flask(__name__, static_folder="dashboard", static_url_path="")
CORS(app, resources={r"/api/*": {"origins": "*"}})
app.register_blueprint(bp)
app.register_blueprint(voice_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)

from dotenv import load_dotenv
from flask import Flask
 
load_dotenv()  # reads backend/.env (put GEMINI_API_KEY there; never commit it)
 
from routes import bp  # noqa: E402  (after load_dotenv so later modules see the env vars)
 
app = Flask(__name__, static_folder="../frontend", static_url_path="")
app.register_blueprint(bp)
 
if __name__ == "__main__":
    # host="0.0.0.0" lets a phone/laptop on the same Wi-Fi reach the Pi. debug=True is for local dev only.
    app.run(host="0.0.0.0", port=5000, debug=True)
 

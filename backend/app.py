import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request

load_dotenv()
from routes import bp  # noqa: E402
from voice import voice_bp  # noqa: E402

app = Flask(__name__, static_folder='dashboard', static_url_path='')
app.register_blueprint(bp)
app.register_blueprint(voice_bp)

@app.before_request
def protect_demo_api():
    if os.getenv('PARKOUR_PUBLIC_DEMO') != '1':
        return None
    allowed = (
        (request.method == 'GET' and request.path in ('/api/count', '/api/destinations', '/api/garages'))
        or (request.method == 'GET' and request.path.startswith('/api/garages/'))
        or (request.method == 'POST' and request.path == '/api/recommend')
        or (request.method == 'POST' and request.path == '/api/voice')
    )
    if request.path.startswith('/api/') and not allowed:
        return jsonify(error='Unavailable in public demo mode'), 403
    return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.getenv('PORT', '5000')))

from flask import Flask

from routes import bp

app = Flask(__name__, static_folder="../frontend", static_url_path="")
app.register_blueprint(bp)

if __name__ == "__main__":
    app.run(debug=True)

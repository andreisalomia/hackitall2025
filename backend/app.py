from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Importăm blueprint-urile
from routes.items import items_bp
from routes.recordings import recordings_bp

# Înregistrăm rutele
app.register_blueprint(items_bp)
app.register_blueprint(recordings_bp)

@app.route('/health')
def health():
    return {"status": "ok", "message": "Tape Recorder Backend is running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
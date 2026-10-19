from flask import Flask, jsonify
import os

app = Flask(__name__)

VERSION = os.getenv("APP_VERSION", "1.0.0")
APP_NAME = "SealShip Protected Workload"

@app.route("/")
def index():
    return jsonify({
        "status": "healthy",
        "app": APP_NAME,
        "version": VERSION,
        "secured_by": "SealShip Trust Engine",
        "integrity": "verified"
    })

@app.route("/healthz")
def healthz():
    return jsonify({"status": "ok"}), 200

@app.route("/api/payload")
def payload():
    return jsonify({
        "data": "Confidential Workload Data",
        "access": "Granted (Chain of Custody Verified)"
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)

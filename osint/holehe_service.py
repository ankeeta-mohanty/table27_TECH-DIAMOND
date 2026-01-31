import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/holehe/check", methods=["POST"])
def check_email():
    data = request.get_json()
    email = data.get("email")

    if not email:
        return jsonify({"error": "Email required"}), 400

    try:
        result = subprocess.run(
            ["holehe", email],
            capture_output=True,
            text=True
        )

        platforms = []

        for line in result.stdout.splitlines():
            if "[+]" in line:
                platform = line.split("[+]")[1].split(":")[0].strip()
                platforms.append(platform)

        return jsonify({
            "email": email,
            "platforms": platforms,
            "count": len(platforms)
        })

    except Exception as e:
        return jsonify({
            "error": "Holehe execution failed",
            "details": str(e)
        }), 500

if __name__ == "__main__":
    app.run(port=7000)

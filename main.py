from flask import Flask, jsonify

app = Flask(__name__)


@app.route("/")
def test():
    return jsonify({"test": 1}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5005)

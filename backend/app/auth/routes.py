from flask import request, jsonify
from flask_login import login_user, logout_user, current_user, login_required
import sqlalchemy as sa
from app import db
from app.auth import bp
from app.models import User


@bp.route("/login", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return jsonify({"message": "Already logged in"}), 400

    data = request.get_json()
    print(data)
    email = data.get("email")
    password = data.get("password")
    print("Headers:", request.headers)
    print(request.data)
    print(email, password)

    user = db.session.scalar(sa.select(User).where(User.email == email))
    if user is None or not user.check_password(password):
        return jsonify({"message": "Invalid email or password"}), 401

    login_user(user, remember=data.get("remember", False))
    return jsonify({"message": "Login successful", "user": {"email": user.email}}), 200


@bp.route("/logout", methods=["POST"])
def logout():
    try:
        if not current_user.is_authenticated:
            return jsonify({"message": "Not logged in"}), 400

        print(current_user.username)
        logout_user()
        return jsonify({"message": "Logout successful"}), 200
    except:
        return jsonify({"message": "Unexpected logout error"}), 500


# should probably just remove username completely
@bp.route("/register", methods=["POST"])
def register():
    print("registering")
    try:
        if current_user.is_authenticated:
            return jsonify({"message": "Already logged in"}), 400

        data = request.get_json()
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")
        if not username:
            username = email

        if (
            User.query.filter_by(username=username).first()
            or User.query.filter_by(email=email).first()
        ):
            return jsonify({"message": "Username or email already exists"}), 400

        user = User(username=username, email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        return jsonify({"message": "Registration successful"}), 201
    except Exception as e:
        print(e)
        return jsonify({"message": "Unexpected register error"}), 500


@bp.route("/verify", methods=["GET"])
def verify_auth():
    is_auth = current_user.is_authenticated
    return jsonify({"auth": is_auth}), 200 if is_auth else 400


@bp.route("/get_user_info", methods=["GET"])
def get_user_info():
    try:
        if not current_user.is_authenticated:
            return jsonify({"message": "Not logged in"}), 401
        return jsonify(
            {
                "username": current_user.username,
                "email": current_user.email,
            }
        ), 200
    except:
        return jsonify({"message": "Unexpected error"}), 500

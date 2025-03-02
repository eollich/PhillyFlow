from app.events import bp
from app.models import Event
from flask import jsonify, request
from app import db
import sqlalchemy as sa
from flask_login import login_required


@bp.route("/")
def all_events():
    events = db.session.scalars(sa.select(Event)).all()
    return jsonify([event.to_dict() for event in events])


@login_required
@bp.route("/create_event", methods=["POST"])
def create_event():
    data = request.get_json()

    # Validate required fields
    required_fields = [
        "name",
        "address",
        "latitude",
        "longitude",
        "capacity",
        "description",
        "start_time",
        "end_time",
        "creator_id",
    ]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Event missing required fields"}), 400

    try:
        new_event = Event(
            name=data["name"],
            address=data["address"],
            latitude=float(data["latitude"]),
            longitude=float(data["longitude"]),
            capacity=int(data["capacity"]) if data["capacity"] else None,
            current_registered=0,  # Default
            description=data["description"],
            start_time=datetime.fromisoformat(data["start_time"]),
            end_time=datetime.fromisoformat(data["end_time"])
            if data["end_time"]
            else None,
            creator_id=int(data["creator_id"]),
        )

        db.session.add(new_event)
        db.session.commit()

        return jsonify(
            {"message": "Event created successfully", "event_id": new_event.id}
        ), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

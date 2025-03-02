from app.events import bp
from app.models import Event, event_attendees
from flask import jsonify, request
from app import db
import sqlalchemy as sa
from flask_login import current_user
from app.main.test_geocoding import geocode_address
from datetime import datetime


@bp.route("/")
def all_events():
    if not current_user.is_authenticated:
        return jsonify({"message": "Not logged in"}), 401
    events = db.session.scalars(sa.select(Event)).all()
    return jsonify([event.to_dict(user_id=current_user.id) for event in events])


@bp.route("/me")
def my_events():
    print(current_user.id)
    if not current_user.is_authenticated:
        return jsonify({"message": "Not logged in"}), 401

    created_events = db.session.scalars(
        sa.select(Event).where(Event.creator_id == current_user.id)
    ).all()

    participating_events = db.session.scalars(
        sa.select(Event)
        .join(event_attendees)
        .where(
            event_attendees.c.user_id == current_user.id,
            Event.creator_id != current_user.id,
        )
    ).all()

    res = {
        "created": [event.to_dict() for event in created_events],
        "participating": [event.to_dict() for event in participating_events],
    }

    return jsonify(res), 200


@bp.route("/create_event", methods=["POST"])
def create_event():
    if not current_user.is_authenticated:
        return jsonify({"message": "Not logged in"}), 401
    print(request.get_json())
    data = request.get_json()
    required_fields = [
        "name",
        "address",
        # "latitude",
        # "longitude",
        # "capacity",
        "description",
        "start_time",
        "end_time",
        # "creator_id",
    ]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Event missing required fields"}), 400

    try:
        coords = None
        try:
            coords = geocode_address(data["address"])
            print(coords)
        except Exception as _:
            return jsonify({"error": "Bad address"}), 400

        new_event = Event(
            name=data["name"],
            address=data["address"],
            latitude=float(coords["lat"]),
            longitude=float(coords["lng"]),
            capacity=int(data.get("capacity"))
            if data.get("capacity") is not None
            else None,
            current_registered=0,
            description=data["description"],
            start_time=datetime.fromisoformat(data["start_time"]),
            end_time=datetime.fromisoformat(data.get("end_time"))
            if data.get("end_time")
            else None,
            creator_id=current_user.id,
        )
        db.session.add(new_event)
        db.session.commit()

        return jsonify(
            {"message": "Event created successfully", "event_id": new_event.id}
        ), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/join_event/<int:event_id>", methods=["POST"])
def join_event(event_id):
    print(current_user)
    if not current_user.is_authenticated:
        print("not auth")
        return jsonify({"message": "Not logged in"}), 401

    event = db.session.get(Event, event_id)
    if not event:
        return jsonify({"error": "Event not found"}), 404

    is_already_attending = db.session.execute(
        sa.select(event_attendees).where(
            event_attendees.c.event_id == event_id,
            event_attendees.c.user_id == current_user.id,
        )
    ).fetchone()

    if is_already_attending:
        return jsonify({"error": "User is already attending this event"}), 400

    if event.capacity is not None and event.current_registered >= event.capacity:
        return jsonify({"error": "Event is at full capacity"}), 400

    try:
        stmt = event_attendees.insert().values(
            event_id=event_id, user_id=current_user.id
        )
        db.session.execute(stmt)

        event.current_registered += 1
        db.session.commit()

        return jsonify({"message": "Successfully joined the event"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


@bp.route("/leave_event/<int:event_id>", methods=["POST"])
def leave_event(event_id):
    if not current_user.is_authenticated:
        return jsonify({"message": "Not logged in"}), 401

    stmt = sa.delete(event_attendees).where(
        (event_attendees.c.user_id == current_user.id)
        & (event_attendees.c.event_id == event_id)
    )

    result = db.session.execute(stmt)
    db.session.commit()

    if result.rowcount == 0:
        return jsonify({"error": "Not attending this event"}), 400

    return jsonify({"message": "Successfully left the event"}), 200

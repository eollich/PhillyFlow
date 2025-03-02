from app.main import bp
from flask import request, jsonify
from flask_login import current_user
from app.models import Incident  # Your Incident model is already defined in models.py
# from app.geocoding import geocode_address  # Function that calls the Google Geocoding API
# from app.utils import haversine_distance

from app.main.import_data import populateIncidents
from app.main.test_geocoding import geocode_address
from app.main.utils import haversine_distance
from app.main.utils import compute_safety_score
from app.main.find_locations import find_basketball_courts as fbc
from datetime import datetime, timedelta
import math

courts = [
    {
        "address": "3301 Market St, Philadelphia",
        "location": {"lat": 39.9563832, "lng": -75.1907082},
        "name": "Daskalakis Athletic Center",
    },
    {
        "address": "3701 Walnut St, Philadelphia",
        "location": {"lat": 39.9536492, "lng": -75.1972917},
        "name": "Penn Campus Recreation",
    },
    {
        "address": "Philadelphia",
        "location": {"lat": 39.957927, "lng": -75.1914725},
        "name": "Buckley Tennis Courts",
    },
]


@bp.route("/")
def index():
    return "Welcome to the Incident API!"


def calculate_safety_score(incidents, lat, lng, radius):
    """
    Computes a normalized safety score (1 = safest, 10 = most dangerous).
    - Filters out incidents older than 6 months (180 days).
    - Uses logarithmic scaling to handle extreme cases.
    """
    nearby_incidents = []
    safety_score = 0
    SIX_MONTHS_AGO = datetime.utcnow() - timedelta(days=180)  # Define 6-month cutoff

    for incident in incidents:
        if incident.date < SIX_MONTHS_AGO:
            print(f"Skipping old incident {incident.id}, date: {incident.date}")
            continue  # Skip incidents older than 6 months

        print("Processing:", incident)
        distance = haversine_distance(lat, lng, incident.latitude, incident.longitude)

        if distance <= radius:
            severity = max(1, min(10, incident.severity))

            days_since_incident = (datetime.utcnow() - incident.date).days
            recency_weight = math.exp(-days_since_incident / 30)

            distance_factor = max(0.01, distance)

            impact = (severity * recency_weight) / distance_factor

            safety_score += impact

            incident_data = {
                "id": incident.id,
                "latitude": incident.latitude,
                "longitude": incident.longitude,
                "severity": severity,
                "date": incident.date.isoformat(),
                "distance": round(distance, 2),
                "impact": round(impact, 3),
            }
            nearby_incidents.append(incident_data)

    # **Dynamic Scaling to Keep Score in 1-10 Range**
    if safety_score == 0:
        normalized_score = 1  # No incidents, safest
    else:
        MAX_POSSIBLE_SCORE = len(incidents) * 10
        normalized_score = 1 + (9 * math.log10(1 + safety_score))  # Logarithmic scaling

    return {
        "safety_score": round(normalized_score, 2),
        # "incidents": nearby_incidents,
    }


@bp.route("/sloc")
def test():
    try:
        lat = current_user.latitude
        lng = current_user.longitude
        incident_rad = 0.2
        courts = fbc(lat, lng, 0.1)
        if not courts:
            return jsonify({"message": "no courts found nearby"}), 200

        courts_with_safety = []

        for court in courts:
            safety_data = calculate_safety_score(
                Incident.query.all(),  # All incidents
                court["location"]["lat"],
                court["location"]["lng"],
                incident_rad,  # Incident search radius
            )

            # Step 3: Prepare court data with safety info
            court_data = {
                "name": court["name"],
                "latitude": court["location"]["lat"],
                "longitude": court["location"]["lng"],
                "safety_score": safety_data["safety_score"],
                # "incidents": safety_data["incidents"],
            }
            courts_with_safety.append(court_data)

        return jsonify({"courts": courts_with_safety}), 200

    except Exception as e:
        return jsonify({"error": f"Could not process request: {str(e)}"}), 500


@bp.route("/bbcourts")
def bbcourts():
    try:
        lat = current_user.latitude
        lng = current_user.longitude
        dist = current_user.distance or 1
        dist = 0.1
        return fbc(lat, lng, dist)
    except Exception as _:
        return jsonify({"error": "could not find courts"}), 500


@bp.route("/populate", methods=["GET"])
def populate():
    populateIncidents()
    return jsonify({"message": "Incidents populated"}), 200


@bp.route("/geocode", methods=["POST"])
def geocode():
    """
    Endpoint to geocode an address using a POST request.

    Expects JSON payload:
      {
        "address": "Center City, Philadelphia"
      }

    Returns:
      JSON with latitude and longitude.
    """
    data = request.get_json()
    if not data or "address" not in data:
        return jsonify({"error": "Missing 'address' in JSON payload"}), 400

    address = data["address"]
    try:
        location = geocode_address(address)
        return jsonify(location), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@bp.route("/incidents_by_coords", methods=["POST"])
def incidents_by_coords():
    """
    Query incidents near given coordinates.

    Expected JSON payload:
      {
          "lat": 39.9525839,
          "lng": -75.1652215,
          "radius": 1.0   # optional, default is 1 mile
      }

    Returns:
      JSON object with a count of nearby incidents and a list of incidents, each with an additional "distance" attribute.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing JSON payload"}), 400

    try:
        lat = float(data.get("lat"))
        lng = float(data.get("lng"))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid or missing 'lat' or 'lng' parameters."}), 400

    # Optional radius parameter (in miles); default to 1.0 mile if not provided.
    try:
        radius = float(data.get("radius", 1.0))
    except (TypeError, ValueError):
        radius = 1.0

    # Query all incidents from the database.
    incidents = Incident.query.all()
    nearby_incidents = []

    for incident in incidents:
        distance = haversine_distance(lat, lng, incident.latitude, incident.longitude)
        if distance <= radius:
            incident_data = {
                "id": incident.id,
                "latitude": incident.latitude,
                "longitude": incident.longitude,
                "severity": incident.severity,
                "date": incident.date.isoformat(),
                "distance": round(distance, 2),
            }
            nearby_incidents.append(incident_data)

    result = {"count": len(nearby_incidents), "incidents": nearby_incidents}
    return jsonify(result), 200


@bp.route("/area_safety", methods=["POST"])
def area_safety():
    """
    Given an area string in the JSON payload, compute the safety score for that area.

    Expected JSON payload:
      {
          "area": "Center City, Philadelphia",
          "radius": 1.0  # Optional: defaults to 1 mile if not provided.
      }
    """
    data = request.get_json()
    if not data or "area" not in data:
        return jsonify({"error": "Missing 'area' in JSON payload"}), 400

    area = data["area"]
    radius = float(data.get("radius", 1.0))

    try:
        # Get coordinates for the area.
        location = geocode_address(area)
        center_lat = location["lat"]
        center_lng = location["lng"]
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # Query incidents from the database.
    all_incidents = Incident.query.all()
    nearby_incidents = []
    for incident in all_incidents:
        distance = haversine_distance(
            center_lat, center_lng, incident.latitude, incident.longitude
        )
        if distance <= radius:
            nearby_incidents.append(incident)

    # Compute the safety score using our helper function.
    safety = compute_safety_score(nearby_incidents)

    return jsonify(
        {
            "area": area,
            "coordinates": {"lat": center_lat, "lng": center_lng},
            "incident_count": len(nearby_incidents),
            "safety_score": round(safety, 2),
        }
    ), 200


# @bp.route('/danger', methods=['GET'])
# def danger():
#     """
#     Returns a danger score for a specified area in Philadelphia.
#     Expects a query parameter 'area'. For example:
#       GET /danger?area=Center+City,+Philadelphia
#     """
#     area = request.args.get('area')
#     if not area:
#         return jsonify({"error": "Missing 'area' parameter."}), 400

#     try:
#         # Get the coordinates for the specified area
#         location = geocode_address(area)
#         center_lat = location['lat']
#         center_lon = location['lng']
#     except Exception as e:
#         return jsonify({"error": f"Error geocoding the area: {str(e)}"}), 500

#     # Define the search radius in miles
#     radius = 1.0

#     # Query all incidents (for a production app, you might add filters by date, etc.)
#     incidents = Incident.query.all()
#     nearby_incidents = []
#     for incident in incidents:
#         # Calculate distance between the incident and the area center
#         distance = haversine_distance(center_lat, center_lon, incident.latitude, incident.longitude)
#         if distance <= radius:
#             nearby_incidents.append(incident)

#     incident_count = len(nearby_incidents)
#     if incident_count > 0:
#         avg_severity = sum(inc.severity for inc in nearby_incidents) / incident_count
#     else:
#         avg_severity = 0

#     danger_score = {
#         "area": area,
#         "incident_count": incident_count,
#         "average_severity": avg_severity,
#         "message": "Danger score based on recent incident data"
#     }

#     return jsonify(danger_score), 200

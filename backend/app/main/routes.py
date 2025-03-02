from app.main import bp
from flask import request, jsonify
import sqlalchemy as sa
from app.models import Incident  # Your Incident model is already defined in models.py
# from app.geocoding import geocode_address  # Function that calls the Google Geocoding API
# from app.utils import haversine_distance

from app.main.import_data import populateIncidents
from app.main.test_geocoding import geocode_address
from app.main.utils import haversine_distance
from app.main.utils import compute_safety_score


@bp.route("/")
def index():
    return "Welcome to the Incident API!"

@bp.route('/populate', methods=['GET'])
def populate():
    populateIncidents()
    return jsonify({"message": "Incidents populated"}), 200

    
@bp.route('/geocode', methods=['POST'])
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



@bp.route('/incidents_by_coords', methods=['POST'])
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
        lat = float(data.get('lat'))
        lng = float(data.get('lng'))
    except (TypeError, ValueError):
        return jsonify({"error": "Invalid or missing 'lat' or 'lng' parameters."}), 400

    # Optional radius parameter (in miles); default to 1.0 mile if not provided.
    try:
        radius = float(data.get('radius', 1.0))
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
                "distance": round(distance, 2)
            }
            nearby_incidents.append(incident_data)

    result = {
        "count": len(nearby_incidents),
        "incidents": nearby_incidents
    }
    return jsonify(result), 200



@bp.route('/area_safety', methods=['POST'])
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
        distance = haversine_distance(center_lat, center_lng, incident.latitude, incident.longitude)
        if distance <= radius:
            nearby_incidents.append(incident)

    # Compute the safety score using our helper function.
    safety = compute_safety_score(nearby_incidents)
    
    return jsonify({
        "area": area,
        "coordinates": {"lat": center_lat, "lng": center_lng},
        "incident_count": len(nearby_incidents),
        "safety_score": round(safety, 2)
    }), 200


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



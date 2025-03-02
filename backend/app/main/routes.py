from app.main import bp
from flask import request, jsonify
import sqlalchemy as sa
from app.models import Incident  # Your Incident model is already defined in models.py
# from app.geocoding import geocode_address  # Function that calls the Google Geocoding API
# from app.utils import haversine_distance

from app.main.import_data import populateIncidents


@bp.route("/")
def index():
    return "Welcome to the Incident API!"

@bp.route('/populate', methods=['GET'])
def populate():
    populateIncidents()
    return jsonify({"message": "Incidents populated"}), 200


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



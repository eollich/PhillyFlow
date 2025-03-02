from app.main import bp
from flask import request, jsonify
import sqlalchemy as sa
from app.models import Incident  # Your Incident model is already defined in models.py
# from app.geocoding import geocode_address  # Function that calls the Google Geocoding API
# from app.utils import haversine_distance
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from app.models import Incident


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



def load_and_preprocess_data():
    # Load dataset
    incidents = Incident.query.all()

    # Convert to a DataFrame
    data = []
    for incident in incidents:
        data.append({
            "latitude": incident.latitude,
            "longitude": incident.longitude,
            "severity": incident.severity,
            "date": incident.date
        })

    df = pd.DataFrame(data)

    # Extract useful time-based features
    df["month"] = df["date"].dt.month
    df["day"] = df["date"].dt.day
    df["day_of_week"] = df["date"].dt.weekday  # Monday=0, Sunday=6
    df["hour"] = df["date"].dt.hour  # If time of day matters

    # Select features
    X = df[["lat", "lng", "month", "day", "day_of_week", "hour"]]  # Assuming 'lt' and 'lng' are the latitude and longitude columns
    y = df["crime_severity"]  # Target variable (1-10 severity level)

    # Normalize input features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    return X_train, X_test, y_train, y_test, scaler


def train_model(X_train, y_train):
    # Train the model
    model = LinearRegression()
    model.fit(X_train, y_train)
    return model

def evaluate_model(model, X_test, y_test):
    # Make predictions
    y_pred = model.predict(X_test)

    # Evaluate the model
    mse = mean_squared_error(y_test, y_pred)
    print(f"Test Mean Squared Error: {mse:.2f}")
    return y_pred

# Load and preprocess data
X_train, X_test, y_train, y_test, scaler = load_and_preprocess_data()

# Train the model
model = train_model(X_train, y_train)

# Evaluate the model
y_pred = evaluate_model(model, X_test, y_test)

# Example: Predict for a specific location and time
def predict_severity(latitude, longitude, epoch_time):
    # Convert epoch time to datetime
    date = pd.to_datetime(epoch_time, unit='s')
    
    # Extract features
    month, day, day_of_week, hour = date.month, date.day, date.weekday(), date.hour
    
    # Prepare input data
    input_data = [[latitude, longitude, month, day, day_of_week, hour]]
    input_scaled = scaler.transform(input_data)
    
    prediction = model.predict(input_scaled)[0]
    return round(prediction, 2)


@bp.route("/testing")
def testing():
    predicted_severity = predict_severity(40.0, -75.0, 1741305600)
    return(f"Predicted Crime Severity: {predicted_severity}")

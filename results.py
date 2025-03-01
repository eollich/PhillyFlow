from data_preprocessing import load_and_preprocess_data
from model import train_model, evaluate_model
import pandas as pd

# Load and preprocess data
X_train, X_test, y_train, y_test, scaler = load_and_preprocess_data("cleaned_data.csv")

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

# Example usage of prediction
predicted_severity = predict_severity(40.0, -75.0, 1741305600)
print(f"Predicted Crime Severity: {predicted_severity}")

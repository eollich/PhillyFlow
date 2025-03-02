import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
import datetime

def load_and_preprocess_data(file_path):
    # Load dataset
    df = pd.read_csv("cleaned_data.csv")

    # Convert epoch timestamp to datetime
    # Convert to datetime (pandas automatically handles timezones)
    df["date"] = pd.to_datetime(df["dispatch_date"])

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

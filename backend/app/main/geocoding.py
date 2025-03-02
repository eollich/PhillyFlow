
import os
import requests
from dotenv import load_dotenv

load_dotenv()  # This will 

def geocode_address(address: str) -> dict:
    """
    Given an address string, use the Google Geocoding API to return its latitude and longitude.
    Returns a dict with keys 'lat' and 'lng'.
    """
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise Exception("Missing GOOGLE_API_KEY environment variable")
    
    base_url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": address,
        "key": api_key
    }
    
    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        raise Exception("Error in geocoding request")
    
    data = response.json()
    if data.get("status") != "OK":
        raise Exception("Geocoding API error: " + data.get("status", "Unknown error"))
    
    # Use the first result from the API
    location = data["results"][0]["geometry"]["location"]
    return location

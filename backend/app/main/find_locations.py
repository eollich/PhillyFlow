import os
import requests
from dotenv import load_dotenv

load_dotenv()


def find_basketball_courts(lat, lng, radius_mi: float = 1):
    radius_meters = radius_mi * 1609
    print(radius_meters)
    """
    Find basketball courts near a given location within a specified radius (default 1 mile).
    """
    api_key = os.getenv("GOOGLE_NEARBY_API")
    if not api_key:
        raise ValueError("Missing GOOGLE_API_KEY environment variable")

    base_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius_meters,
        "keyword": "basketball court",
        "type": "point_of_interest",
        "key": api_key,
    }

    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        raise RuntimeError(f"HTTP error: {response.status_code} - {response.text}")

    data = response.json()
    status = data.get("status")

    if status == "ZERO_RESULTS":
        return []  # No courts found, return an empty list

    if status != "OK":
        raise RuntimeError(
            f"Places API error: {status} - {data.get('error_message', 'No details')}"
        )

    courts = [
        {
            "name": place.get("name"),
            "address": place.get("vicinity"),
            "location": place["geometry"]["location"],
        }
        for place in data.get("results", [])
    ]

    return courts

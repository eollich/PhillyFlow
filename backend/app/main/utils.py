# app/utils.py
import math

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great-circle distance between two points on the Earth (in miles).
    
    Args:
        lat1, lon1: Latitude and longitude of the first point.
        lat2, lon2: Latitude and longitude of the second point.
    
    Returns:
        float: The distance between the two points in miles.
    """
    R = 3958.8  # Earth radius in miles
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# app/utils.py
import math

def compute_safety_score(incidents):
    """
    Compute a safety score for an area based on nearby incidents.
    
    Each incident is assumed to have a 'severity' attribute (0 to 10).
    
    The safety score is calculated on a scale from 0 (least safe) to 100 (most safe).
    
    Formula:
        - n: number of incidents
        - s_avg: average severity of incidents
        - s_norm: normalized severity = s_avg / 10
        - danger_index = s_norm * ln(n + 1)
        - safety_score = max(0, 100 - (danger_index * scaling_factor))
        
    A suggested scaling_factor is 50, which you may adjust based on your data.
    
    Returns 100 if no incidents are found.
    """
    n = len(incidents)
    if n == 0:
        return 100.0  # Completely safe if no incidents are present.
    
    # Calculate the average severity.
    total_severity = sum(incident.severity for incident in incidents)
    avg_severity = total_severity / n
    
    # Normalize the average severity (0 to 1 scale).
    normalized_severity = avg_severity / 10.0
    
    # Compute the danger index.
    danger_index = normalized_severity * math.log(n + 1)
    
    # Choose a scaling factor to adjust the impact (tune as needed).
    scaling_factor = 50
    
    # Compute the safety score (clamp to a minimum of 0).
    safety_score = max(0, 100 - danger_index * scaling_factor)
    return safety_score


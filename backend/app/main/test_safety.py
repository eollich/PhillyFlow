from app.models import Incident
from app.main.utils import compute_safety_score

def test_safety_score():

    # Let's say you already have some incidents in the database.
    incidents = Incident.query.all()
    
    # Compute the safety score for these incidents.
    safety = compute_safety_score(incidents)
    print(f"Safety Score for the area: {safety:.2f}")

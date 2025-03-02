from app.models import Incident
def populateIncidents():
    print("hi")
    file_path = 'app/main/cleaned_data.csv'
    with open(file_path, 'rb') as f:
        count = Incident.import_from_csv(f)
        print(f"Imported {count} incidents.")

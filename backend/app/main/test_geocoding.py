from app.main.geocoding import geocode_address

def confirmGoogle():
    print("hello")
    try:
        location = geocode_address("Center City, Philadelphia")
        print("Coordinates:", location)
    except Exception as e:
        print("Error:", e)
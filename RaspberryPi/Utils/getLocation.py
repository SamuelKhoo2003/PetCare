import requests, math

def approxLocation():
    API_KEY = "1vzGoHKYkOjOgaXuFh9B"  # Your API key
    url = f"https://extreme-ip-lookup.com/json/?key={API_KEY}"

    response = requests.get(url)
    data = response.json()

    if response.status_code == 200:
        latitude = data.get("lat", "N/A")
        longitude = data.get("lon", "N/A")
        # print(f"Latitude: {latitude}, Longitude: {longitude}")
        return [latitude, longitude]
    else:
        print("Error fetching data:", data)

def haversine(lat1, lon1, lat2, lon2, unit='km'):
    """
    Calculate the great-circle distance between two points
    given their latitude and longitude using the Haversine formula.
    Parameters:
        lat1, lon1: Latitude and Longitude of point 1 (in degrees)
        lat2, lon2: Latitude and Longitude of point 2 (in degrees)
        unit: 'km' for kilometers (default) or 'mi' for miles
    Returns:
        Distance between the two points in the specified unit.
    """
    # Convert latitude and longitude from degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Radius of Earth
    radius_km = 6371  # in kilometers

    # Compute the distance
    distance_km = radius_km * c
    return distance_km if unit == 'km' else distance_km * 1000

# lat1, lon1 = 52.5200, 13.4050  # Berlin
# lat2, lon2 = 51.8566, 2.3522   # Paris
# print(f"Distance: {haversine(lat1, lon1, lat2, lon2, 'km'):.2f} km")

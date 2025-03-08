import time, firebase_admin
from datetime import datetime
from firebase_admin import credentials, db
from RaspberryPi.getLocation import haversine
import random

cred = credentials.Certificate("RaspberryPi/firebaseSecurityKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://petcare-2025-default-rtdb.europe-west1.firebasedatabase.app/"
})

def WriteHttp(collar_id, data):
    """Writes data to the Firebase Realtime Database under /collars/{collar_id}."""
    ref = db.reference(f"/collars/{collar_id}")

    # Get the current date
    now = datetime.now()
    current_date = now.strftime("%Y-%m-%d")
    current_hour = now.strftime("%Y-%m-%d %H:00:00")

    # Fetch existing data
    existing_data = ref.get() or {}

    last_date = existing_data.get("date", None)
    last_hour = existing_data.get("hour", None)
    last_calories = existing_data.get("calories", 0)
    last_distance = existing_data.get("distance", 0)
    last_longitude, last_latitude = existing_data.get("longitude", 0), existing_data.get("latitude", 0)
    historical_calories = existing_data.get("historical_calories", {})
    hourly_temperature_history = existing_data.get("hourly_temperature_history", {})
    temperature_readings = existing_data.get("temperature_readings", [])

    # Check for daily reset
    if last_date != current_date:
        historical_calories[last_date] = last_calories
        if len(historical_calories) > 5:
            del historical_calories[min(historical_calories.keys())]

        ref.update({
            "historical_calories": historical_calories,
            "calories": 0,
            "distance": 0,
        })
        last_calories = 0
        last_distance = 0

    # Check for hourly reset
    if last_hour != current_hour and temperature_readings:
        avg_temperature = sum(temperature_readings) / len(temperature_readings)
        hourly_temperature_history[last_hour] = round(avg_temperature, 2)

        if len(hourly_temperature_history) > 6:
            del hourly_temperature_history[min(hourly_temperature_history.keys())]

        temperature_readings = []

    # Append new temperature reading
    temperature_readings.append(data["temperature"])

    # Update Firebase
    ref.update({
        "date": current_date,
        "hour": current_hour,
        "current_time": now.strftime("%Y-%m-%d %H:%M:%S"),
        "temperature": data["temperature"],
        "sleeping": data["is_sleeping"],
        "calories": last_calories + data["calories"],
        "longitude": data["longitude"],
        "latitude": data["latitude"],
        "distance": last_distance + round(haversine(last_latitude, last_longitude, data["latitude"], data["longitude"]), 1),
        "temperature_readings": temperature_readings,
        "hourly_temperature_history": hourly_temperature_history
    })

    print(f"Data sent successfully under /collars/{collar_id}/!")


# ============================== #
#           TESTING MAIN         #
# ============================== #

def generate_test_data():
    """Generates random test data for pet tracking."""
    return {
        "temperature": round(random.uniform(20, 30), 1),  # Random temperature between 20°C and 30°C
        "is_sleeping": random.choice([True, False]),
        "calories": random.randint(1, 5),
        "latitude": round(random.uniform(40.0, 41.0), 6),  # Random latitude
        "longitude": round(random.uniform(-74.0, -73.0), 6),  # Random longitude
    }

def main():
    collar_id = "test_collar_123"
    print("Starting pet tracking simulation... Press Ctrl+C to stop.")

    try:
        while True:
            test_data = generate_test_data()
            newWriteHTTP(collar_id, test_data)
            time.sleep(5)  # Simulate new data every 5 seconds
    except KeyboardInterrupt:
        print("\nSimulation stopped.")

if __name__ == "__main__":
    main()
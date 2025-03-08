import firebase_admin
from firebase_admin import credentials, db
import random
from datetime import datetime
import time

# Initialize Firebase
cred = credentials.Certificate("RaspberryPi/firebaseSecurityKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://petcare-2025-default-rtdb.europe-west1.firebasedatabase.app/"
})

# Reading JSON data (change path accordingly to an outputted one)
# with open("RaspberryPi\\CompletePiZeroCommunication\\Json 2025-02-03 16 07 57.json", "r") as file:
#     data = json.load(file)
 
# Process the data (example logic)
json_calories = random.choice([1, 2])  # Randomly choose between 1 and 2 for calories
json_temp = random.randint(30, 38)  # Random temperature between 30 and 38
json_air_quality = random.randint(1, 12)

# Reference the database path
collarId = None
while collarId == None or not collarId.isalnum():
    collarId = input("Please enter an alphanumeric string as the collarId for this raspberry pi:")

start_time = time.time()
ref = db.reference(f"/collars/{collarId}")  # Path to store the data

# Get the current date (formatted as YYYY-MM-DD)
current_date = datetime.now().strftime("%Y-%m-%d")

# Check if data for the current day already exists
existing_data = ref.get()

# this logic can be used when updating steps/calories
if existing_data:
    last_date = existing_data.get("date", None)
    last_calories = existing_data.get("calories", 0)

    # If it's the same day, add the new calories to the previous value
    if last_date == current_date:
        updated_calories = last_calories + json_calories
    else:
        # If it's a new day, reset calories to 0 and add the new calories
        historical_calories = existing_data.get("historical_calories", {})
        historical_calories[last_date] = last_calories
        if len(historical_calories) > 5:
            first_key = list(historical_calories.keys())[0]  # Get the first key (oldest)
            del historical_calories[first_key]
        ref.update({
            "historical_calories": historical_calories,
        })
        # print("updated")
        updated_calories = json_calories
else:
    # If no data exists, set calories to the new value
    updated_calories = json_calories

ref.update({
    "date": current_date,
    "current_time": f"{datetime.now()}",
    "calories": updated_calories,
    "temp": json_temp,
    "air_quality": json_air_quality
})

end_time = time.time()

print(f"Data sent successfully under /collars/{collarId}/ in {end_time - start_time} seconds!")

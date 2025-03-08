import firebase_admin
from firebase_admin import credentials, db
import json

# Initialize Firebase
cred = credentials.Certificate("RaspberryPi/firebaseSecurityKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://petcare-2025-default-rtdb.europe-west1.firebasedatabase.app/"
})

collarId = input("Enter the collarId you want to retrieve data for: ")

ref = db.reference(f"/collars/{collarId}")
data = ref.get()

if data:
    print(f"Data for {collarId}:")
    print(json.dumps(data, indent=4))
else:
    print(f"No data found for collarId: {collarId}")

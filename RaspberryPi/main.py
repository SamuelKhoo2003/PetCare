import time
import math
import statistics
from RaspberryPi.writeFirebase import WriteHTTP
from RaspberryPi.Utils.readSensor import readSensorData
from RaspberryPi.Utils.signalProcessing import filterSignal
from RaspberryPi.Utils.activityCalculation import AEECalculation, sleepStateCheck
from RaspberryPi.Utils.getLocation import approxLocation

# Constants
COLLAR_ID = "raspberrypi1"
SLEEP_THRESHOLD = 30  # Seconds
SENSOR_READ_INTERVAL = 0.1  # Interval between sensor reads
DATA_COLLECTION_DURATION = 10  # Duration for data collection
SLEEP_CHECK_PARAMS = (0.05, 0.002)
AEE_PARAMS = (0.03, 20)

def collect_sensor_data():
    """Collects sensor data for a set duration."""
    start_time = time.time()
    raw_data = {"svm": [], "temperature": []}

    while time.time() - start_time < DATA_COLLECTION_DURATION:
        data_in = readSensorData()
        svm = math.sqrt(sum(x**2 for x in data_in[:3])) - 1
        raw_data["svm"].append(svm)
        raw_data["temperature"].append(data_in[3])
        time.sleep(SENSOR_READ_INTERVAL)

    return raw_data

def filter_data(raw_data):
    """Applies signal filtering to collected data."""
    return {key: [filterSignal(values)] for key, values in raw_data.items()}

def determine_sleep_state(filtered_svm, sleep_timer):
    """Determines if the collar is in a sleeping state."""
    if sleepStateCheck(filtered_svm, *SLEEP_CHECK_PARAMS):
        return (True if time.time() - sleep_timer > SLEEP_THRESHOLD else False), sleep_timer
    return False, time.time()

def main():
    sleep_timer = time.time()

    while True:
        print("10 Second Sensor Collection Started")
        raw_data = collect_sensor_data()
        filtered_data = filter_data(raw_data)

        sleep_state, sleep_timer = determine_sleep_state(filtered_data["svm"], sleep_timer)
        mean_temp = statistics.mean(filtered_data["temperature"])
        avg_calories = AEECalculation(filtered_data["svm"], *AEE_PARAMS)
        lat, lon = map(float, approxLocation())

        data = {
            "temperature": mean_temp,
            "is_sleeping": sleep_state,
            "calories": avg_calories,
            "latitude": lat,
            "longitude": lon,
        }

        print("Data Sample Collected. Preparing for Database Writing.")
        WriteHTTP(COLLAR_ID, data)
        print("Transfer Complete")

if __name__ == "__main__":
    main()

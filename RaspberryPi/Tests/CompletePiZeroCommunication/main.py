import time
import math
import matplotlib.pyplot as plt
import json
from datetime import datetime
from readSensor import readSensorData
from signalProcessing import filterSignal
from mqqtTransfer import transferData

bufferSize = 10

while True:
    count = 0 # Used for variable buffer size until 10 elements present

    timeArray = []

    # 0 - svmArray
    # 1 - tempArray
    dataArray = [[], []]
    filteredDataArray = [[], [], []]

    start = time.time()

    while time.time() - start < 8: # 5 Second timer

        #Record the time for the current sample
        current_time = time.time() - start  # Time elapsed since the start
        timeArray.append(current_time)

        # Read Data
        dataIn = readSensorData()

        # SVM calculation to work out the absolute acceleration.
        svm = math.sqrt(dataIn[0]**2 + dataIn[1]**2 + dataIn[2]**2) - 1
        dataArray[0].append(svm)
        print(svm)

        # Read temperature
        dataArray[1].append(dataIn[3])

        for i in range(len(dataArray)):
            filteredDataArray[i].append(filterSignal(dataArray[i]))

        # Sleep to prevent excessive I2C reads
        time.sleep(0.1)  # Adjust delay as needed
        ## End of 5 second data acquisition

        filteredDataArray[2] = timeArray
    
    transferData(filteredDataArray)
    print(len(filteredDataArray[0]))

    print("Data Sample Collected")

    data = {
        "time"  : filteredDataArray[2],
        "svm"   : filteredDataArray[0],
        "temp"  : filteredDataArray[1]
    }

    current_timestamp = time.time()
    # Convert to 24-hour format with date and time
    current_time = datetime.fromtimestamp(current_timestamp).strftime('%Y-%m-%d %H %M %S')

    jsonString = "Json " + str(current_time) + ".json"
    with open(jsonString, "w") as json_file:
        json.dump(data, json_file, indent=4)  # indent=4 makes it readable



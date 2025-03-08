import time
import smbus2
import matplotlib
from datetime import datetime
import matplotlib.pyplot as plt
import json
import statistics

matplotlib.use('Agg')

si7021_ADD = 0x40 #Add the I2C bus address for the sensor here
si7021_READ_TEMPERATURE = 0xF3#Add the command to read temperature here


bus = smbus2.SMBus(1)


bufferSize = 10

while True:
    print("Reset")
    bufferArray = []
    timeArray = []
    valueArray = []
    modArray = []
    start = time.time()
    while time.time() - start < 5:
        print("In Loop")
        #Set up a write transaction that sends the command to measure temperature
        cmd_meas_temp = smbus2.i2c_msg.write(si7021_ADD,[si7021_READ_TEMPERATURE])

        #Set up a read transaction that reads two bytes of data
        read_result = smbus2.i2c_msg.read(si7021_ADD,2)

        #Execute the two transactions with a small delay between them
        bus.i2c_rdwr(cmd_meas_temp)
        time.sleep(0.01)
        bus.i2c_rdwr(read_result)

        #convert the result to an int
        tempSensorValue = int.from_bytes(read_result.buf[0]+read_result.buf[1],'big')
        temperature = 175.72*tempSensorValue/65536-46.58
        valueArray.append(temperature)

        #Record the time for the current sample
        current_time = time.time() - start  # Time elapsed since the start
        timeArray.append(current_time)

        if len(bufferArray) < bufferSize:
            bufferArray.append(temperature)
        else:
            bufferArray.pop(0)
            bufferArray.append(temperature)
        modArray.append(statistics.median(bufferArray))

    data = {
        "time": timeArray,
        "raw": valueArray,
        "filtered":modArray
    }
  
    # Clear the plot before creating a new one
    plt.clf()

    # Plot the data
    plt.plot(timeArray, valueArray, timeArray, modArray)

    current_timestamp = time.time()
    # Convert to 24-hour format with date and time
    current_time = datetime.fromtimestamp(current_timestamp).strftime('%Y-%m-%d %H %M %S')

    plotString = "Plot " + str(current_time) + ".png"
    
    plt.savefig(plotString)
    print(f"Plot saved as {plotString}")

    jsonString = "Json " + str(current_time) + ".json"
    with open(jsonString, "w") as json_file:
        json.dump(data, json_file, indent=4)  # indent=4 makes it readable
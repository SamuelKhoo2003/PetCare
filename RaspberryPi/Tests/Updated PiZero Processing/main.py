import time
import smbus2
import math
import statistics
import matplotlib.pyplot as plt
import matplotlib
from datetime import datetime

ACCEL_SENSITIVITY = 16384.0  # Default for ±2g
bufferSize = 10

# I2C address
MPU6050_ADDR = 0x68
tempAddress = 0x40

# Sensor Registers
PWR_MGMT_1 = 0x6B
ACCEL_XOUT_H = 0x3B
# TEMP_OUT_H = 0x41
GYRO_XOUT_H = 0x43
tempReg = 0xF3

# Initialize I2C bus
bus = smbus2.SMBus(1)

# Wake up the MPU6050 (it starts in sleep mode)
bus.write_byte_data(MPU6050_ADDR, PWR_MGMT_1, 0)

# Function to read raw 16-bit values (high and low byte)
def read_raw_data(addr):
    high = bus.read_byte_data(MPU6050_ADDR, addr)  # High byte
    low = bus.read_byte_data(MPU6050_ADDR, addr + 1)  # Low byte
    value = (high << 8) | low  # Combine high and low byte
    
    # Convert to signed value (MPU6050 returns values in 2's complement)
    if value > 32767:
        value -= 65536
    return value

def readTempSensor(tempAddress, tempReg):
    cmd_meas_temp = smbus2.i2c_msg.write(tempAddress,[tempReg])
    read_result = smbus2.i2c_msg.read(tempAddress,2)
    bus.i2c_rdwr(cmd_meas_temp)
    time.sleep(0.1)
    bus.i2c_rdwr(read_result)
    #convert the result to an int
    tempRaw = int.from_bytes(read_result.buf[0]+read_result.buf[1],'big')
    tempDeg = 175.72*tempRaw/65536-46.58
    return tempDeg

try:
    while True:
        count = 0 # Used for variable buffer size until 10 elements present

        timeArray = []

        tempArray = []
        xAccArray = []
        yAccArray = []
        zAccArray = []
        svmArray  = []

        tempArrayFiltered = []
        xAccArrayFiltered = []
        yAccArrayFiltered = []
        zAccArrayFiltered = []
        svmArrayFiltered  = []

        start = time.time()

        while time.time() - start < 5: # 5 Second timer

            #Record the time for the current sample
            current_time = time.time() - start  # Time elapsed since the start
            timeArray.append(current_time)


            # Read acceleration
            accel_x = read_raw_data(ACCEL_XOUT_H)/ ACCEL_SENSITIVITY
            accel_y = read_raw_data(ACCEL_XOUT_H + 2)/ ACCEL_SENSITIVITY
            accel_z = (read_raw_data(ACCEL_XOUT_H + 4)/ ACCEL_SENSITIVITY)-1

            # SVM calculation to work out the absolute acceleration.
            svm = math.sqrt(accel_x**2 + accel_y**2 + accel_z**2)

            # Read temperature
            tempDeg = readTempSensor(tempAddress, tempReg)

            # Store data in respective arrays
            tempArray.append(tempDeg)
            xAccArray.append(accel_x)
            yAccArray.append(accel_y)
            zAccArray.append(accel_z)
            svmArray.append(svm)

            arrayLength = len(tempArray)


            # Computation for variable sized buffer of the past 10 samples:
            if arrayLength<bufferSize:
                count +=1
            else:
                count = bufferSize

            tempArrayFiltered.append(statistics.median(tempArray[arrayLength-count:arrayLength]))
            xAccArrayFiltered.append(statistics.median(xAccArray[arrayLength-count:arrayLength]))
            yAccArrayFiltered.append(statistics.median(yAccArray[arrayLength-count:arrayLength]))
            zAccArrayFiltered.append(statistics.median(zAccArray[arrayLength-count:arrayLength]))
            svmArrayFiltered.append(statistics.median(svmArray[arrayLength-count:arrayLength]))

            # Sleep to prevent excessive I2C reads
            time.sleep(0.5)  # Adjust delay as needed
            ## End of 5 second data acquisition
            
        print("Data Sample Collected")
        plt.clf()
        plt.plot(timeArray, tempArray, timeArray, tempArrayFiltered)
        plotString = "X Temperature Plot" + str(datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H %M %S')) + ".png"
        plt.savefig(plotString)

        plt.clf()
        plt.plot(timeArray, xAccArray, timeArray, xAccArrayFiltered)
        plotString = "X X Acceleration Plot" + str(datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H %M %S')) + ".png"
        plt.savefig(plotString)

        plt.clf()
        plt.plot(timeArray, yAccArray, timeArray, yAccArrayFiltered)
        plotString = "X Y Acceleration Plot" + str(datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H %M %S')) + ".png"
        plt.savefig(plotString)

        plt.clf()
        plt.plot(timeArray, zAccArray, timeArray, zAccArrayFiltered)
        plotString = "X Z Acceleration Plot" + str(datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H %M %S')) + ".png"
        plt.savefig(plotString)

        plt.clf()
        plt.plot(timeArray, svmArray, timeArray, svmArrayFiltered)
        plotString = "X SVM Plot" + str(datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H %M %S')) + ".png"
        plt.savefig(plotString)
        print("All Plots Saved")




except KeyboardInterrupt:
    print("\nStopping sensor readings and terminating execution.")
    bus.close()

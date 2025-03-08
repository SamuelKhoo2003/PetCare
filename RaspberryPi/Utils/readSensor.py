import time
import smbus2

######## Constants ########
ACCEL_SENSITIVITY = 16384.0  # Default for ±2g

######## Register Definitions ########
# I2C addresses
MPU6050_ADDR = 0x68
tempAddress = 0x40

# Sensor Register Addresses 
PWR_MGMT_1 = 0x6B   # Power Management (Accelerometer)
ACCEL_XOUT_H = 0x3B # X axis acceleration (acts as a base address) (Accelerometer)
tempReg = 0xF3      # Temperature register (Temperature Sensor)

######## Bus Initialisation ########
bus = smbus2.SMBus(1)

######## READ MPU6050 ########
def read_raw_data(addr):
    bus.write_byte_data(MPU6050_ADDR, PWR_MGMT_1, 0)
    high = bus.read_byte_data(MPU6050_ADDR, addr)  # High byte
    low = bus.read_byte_data(MPU6050_ADDR, addr + 1)  # Low byte
    value = (high << 8) | low  # Combine high and low byte
    
    # Convert to signed value (MPU6050 returns values in 2's complement)
    if value > 32767:
        value -= 65536
    return value

######## Read Temperature Sensor ########
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

def readSensorData():
    try:
        accel_x = read_raw_data(ACCEL_XOUT_H)/ ACCEL_SENSITIVITY
        accel_y = read_raw_data(ACCEL_XOUT_H + 2)/ ACCEL_SENSITIVITY
        accel_z = (read_raw_data(ACCEL_XOUT_H + 4)/ ACCEL_SENSITIVITY)
        tempDeg = readTempSensor(tempAddress, tempReg)
        return [accel_x, accel_y, accel_z, tempDeg]
    except KeyboardInterrupt:
        print("\nStopping sensor readings and terminating execution.")
        bus.close()
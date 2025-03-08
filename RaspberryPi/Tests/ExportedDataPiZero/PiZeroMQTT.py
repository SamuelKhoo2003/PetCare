import paho.mqtt.client as mqtt
import json
import random
import time

# MQTT Broker details
BROKER = "test.mosquitto.org"
PORT = 1883  # Unencrypted port
SSL_PORT = 8884  # Secure port
TOPIC = "IC.embedded/GROUP_NAME/sensor"

# Enable SSL (set to True if using SSL)
USE_SSL = True
# Generate random sensor data
def get_sensor_data():
    return {
        "temperature": round(random.uniform(20.0, 30.0), 2),
        "humidity": round(random.uniform(40.0, 60.0), 2),
        "motion_detected": random.choice([True, False]),
        "sensor_id": "sensor_01"
    }

# Callback function when a message is received
def on_message(client, userdata, message):
    print(f"Received message: {message.payload.decode()} on topic {message.topic}")

# Setup MQTT Client
client = mqtt.Client()

# Set callback function for received messages
client.on_message = on_message

# Enable SSL if required
if USE_SSL:
    client.tls_set(ca_certs="mosquitto.org.crt", certfile="client.crt", keyfile="client.key")
    client.connect(BROKER, SSL_PORT)
else:
    client.connect(BROKER, PORT)

# Subscribe to the topic
client.subscribe("IC.embedded/GROUP_NAME/#")

# Start the MQTT client loop in the background
client.loop_start()

try:
    while True:
        # Create sensor data JSON
        sensor_data = get_sensor_data()
        json_message = json.dumps(sensor_data)

        # Publish the sensor data
        MSG_INFO = client.publish(TOPIC, json_message)

        # Check if publish was successful
        if MSG_INFO.rc == 0:
            print("Published:", json_message)
        else:
            print("Publish failed:", mqtt.error_string(MSG_INFO.rc))

        # Wait before sending the next data update
        time.sleep(5)

except KeyboardInterrupt:
    print("\nDisconnecting from MQTT broker...")
    client.loop_stop()
    client.disconnect()

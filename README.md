# Embedded-Systems

![PetCare Demo](Website/src/images/petcare-mockup-2.png)

## Overview
This project was developed as part of the 2025 Embedded Systems module for the Department of Electrical Engineering at Imperial College London. The project consists of three main components: a mobile app, a Raspberry Pi setup, and a website. Each component plays a crucial role in the overall functionality of the system.

## App
The app is a mobile interface where users can sign up and register to view the data collected from the Raspberry Pis. It provides a user-friendly experience for monitoring and managing the data. Users can create accounts, log in, and access real-time data from the sensors connected to the Raspberry Pis.

### Running the App Locally
1. Install Expo CLI: `npm install -g expo-cli`
2. Navigate to the app directory: `cd app`
3. Install dependencies: `npm install`
4. Start the app: `expo start`

## Raspberry Pi
The Raspberry Pis are connected to various sensors and are responsible for collecting and sending data to Firebase. The scripts in this section handle the data collection and transmission processes. The Raspberry Pis ensure that the data is accurately captured and sent to the cloud for further analysis and visualization.

### Running the Raspberry Pi Scripts
1. Ensure Python is installed on the Raspberry Pi.
2. Navigate to the scripts directory: `cd raspberry-pi`
3. Install required Python packages: `pip install -r requirements.txt`
4. Run the data collection script: `python collect_data.py`

## Website
The website serves as marketing material for the project. It provides information about the project, its features, and its benefits. The website is designed to attract potential users and stakeholders by showcasing the capabilities and advantages of the system. It includes detailed descriptions, images, and other relevant content to effectively communicate the project's value.

### Running the Website Locally
1. Navigate to the website directory: `cd website`
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
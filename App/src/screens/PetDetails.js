import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { getCollarData } from "../utils/firebaseDatabase";
import { loadUserFromStorage } from "../utils/storage";
import { deletePetData } from "../utils/firebaseDatabase";
import { LinearGradient } from "expo-linear-gradient";
import { formatTimestamp, getLastNDays, getLastNHours, fetchAirPollution, fetchWeather } from "../utils/helper_utils";
import moment from "moment";
import { get, set } from "firebase/database";

const screenWidth = Dimensions.get("window").width;
const stepsPerKm = 1600; // can be made dynamic for pet's stride e.g. different for cat and dog
const openWeatherApiKey = "6b2d6b3bf7993e113d4206e6d50df132"

const chartConfig = {
  backgroundGradientFrom: "#f4f4f4",
  backgroundGradientTo: "#f4f4f4",
  decimalPlaces: 1, // Rounds decimal values
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: {
    borderRadius: 10
  },
  propsForDots: {
    r: "4",
    strokeWidth: "2",
    stroke: "#008080",
  },
};

const PetDetails = ({ route }) => {
  const navigation = useNavigation();
  const { pet } = route.params;
  const minTemp = 36.5;
  const maxTemp = 42.5;
  const handleDelete = async (id) => {
    console.log("Delete pet with id:", id);
    const user = await loadUserFromStorage();
    await deletePetData(user.uid, id);
    setModalVisible(false);
    navigation.navigate("HomeScreen");
  };

  // States to hold the fetched data
  const [modalVisible, setModalVisible] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [distanceTravelled, setDistanceTravelled] = useState(0)
  const [bodyTemperature, setBodyTemperature] = useState(38); // Fake body temp data
  const [isAsleep, setIsAsleep] = useState(true);
  const [calories, setCalories] = useState(0);
  const [historicalCalories, setHistoricalCalories] = useState({});
  const [historicalTemps, setHistoricalTemps] = useState({})
  const [lastUpdated, setLastUpdated] = useState("");
  const [aqiValue, setAqiValue] = useState(0);
  const [weatherValue, setWeatherValue] = useState("");
  const [weatherIcon, setWeatherIcon] = useState("");
  const [longitude, setLongitude] = useState(0);
  const [latitude, setLatitude] = useState(0);


  useEffect(() => {
    // Fetch collar data
    const collarId = pet.collarId; // Assuming collarId is available from pet object
    getCollarData(collarId, (data) => {
      if (data) {
        // console.log(data)
        setHistoricalCalories(data.historical_calories || {});
        setHistoricalTemps(data.hourly_temperature_history || {});
        setCalories(data.calories || 0); // Fetch real steps data
        setDistanceTravelled(data.distance || 0);
        setBodyTemperature(data.temperature || 0); // Fetch real body temperature data
        setLastUpdated(data.current_time || "");
        setIsAsleep(data.sleeping);
        setLongitude(data.longitude || 0);
        setLatitude(data.latitude || 0);
      }
      else {
        console.log("No data found for collar ID:", collarId);
      }
      console.log(historicalCalories)
    });
  }, [pet]);

  useEffect(() => {
    const fetchWeatherAndAirQuality = async () => {
      if (latitude !== 0 && longitude !== 0) {
        try {
          // console.log("we run here")
          const airQuality = await fetchAirPollution(latitude, longitude, openWeatherApiKey);
          const weatherData = await fetchWeather(latitude, longitude, openWeatherApiKey);
          setAqiValue(airQuality);
          setWeatherValue(weatherData.weatherValue);
          setWeatherIcon(weatherData.weatherIcon);
        } catch (error) {
          console.error("Error fetching weather or air quality data:", error);
        }
      }
    };

    fetchWeatherAndAirQuality();
  }, [longitude, latitude]); // Runs when latitude or longitude changes

  const { caloricLabels, caloricDataValues } = useMemo(() => {
    console.log("Raw Historical Calories:", historicalCalories);
    const last5Days = getLastNDays(historicalCalories, 5);
    const labels = Object.keys(last5Days).map((date) =>
      moment(date).format("DD/MM")
    );
    const values = Object.values(last5Days);
  
    console.log("Computed Caloric Labels:", labels);
    console.log("Computed Caloric Data Values:", values);
  
    return { caloricLabels: labels, caloricDataValues: values };
  }, [historicalCalories]);

  const { tempLabels, tempDataValues } = useMemo(() => {
    console.log("Raw Historical Temps:", historicalTemps);
  
    const last11HoursTemps = getLastNHours(historicalTemps, 11);
    console.log(last11HoursTemps)
    
    const labels = Object.keys(last11HoursTemps).map((timestamp) =>
      moment(timestamp, "YYYY-MM-DD HH:mm:ss").format("HH:mm")
    );
  
    const values = Object.values(last11HoursTemps).map(parseFloat);

    console.log("Computed Temp Labels:", labels);
    console.log("Computed Temp Data Values:", values);
   
    return { tempLabels: labels, tempDataValues: values };
  }, [historicalTemps]);

  const percentage = Math.max(0, Math.min(1, (bodyTemperature - minTemp) / (maxTemp - minTemp)));
  const barWidth = Dimensions.get('window').width * 0.8; // 80% of screen width
  const indicatorPosition = percentage * barWidth;
  const { date, time } = formatTimestamp(lastUpdated);

  return (
    <View style={styles.container}>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to delete this pet?</Text>

            <View style={styles.buttonContainer}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              {/* Confirm Delete Button */}
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={() => handleDelete(pet.collarId)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Icon name="arrow-back" size={30} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="delete" size={30} color="#fff" />
      </TouchableOpacity>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={{ textAlign: "center", marginVertical: 20 }}>
          Last updated on{" "}
          <Text style={{ fontWeight: "bold" }}>{date}</Text> at{" "}
          <Text style={{ fontWeight: "bold" }}>{time}</Text>
        </Text>

        <View style={styles.dataContainer}>
          {/* Left Side: Awake/Sleep Status */}
          <View style={styles.statusContainer}>
            <Icon
              name={isAsleep ? "bedtime": "wb-sunny"}
              size={40}
              color={isAsleep ? "#2C3E50" : "#F39C12"}
              style={styles.statusIcon}
            />
            <Text style={styles.statusText}>{isAsleep ? "Sleep" : "Awake"}</Text>
          </View>

          {/* Right Side: Calories Burned */}
          <View style={styles.caloriesContainer}>
            <Text style={styles.caloriesLabel}>Calories Burnt</Text>
            <Text style={styles.caloriesValue}>{Math.round(calories)}</Text>
          </View>
        </View>

        <View style={styles.dataContainer}>
          {/* Right Side: Steps Done & Distance */}
          <TouchableOpacity onPress={() => setShowSteps((prev) => !prev)} style={styles.distanceContainer}>
            <Text style={styles.distanceLabel}>
              {showSteps ? "Steps Today" : "Distance Travelled"}
            </Text>
            <Text style={styles.distanceValue}>
              {showSteps
                ? Math.round(distanceTravelled * stepsPerKm)
                : Number(distanceTravelled).toFixed(2) + " km"}
            </Text>
          </TouchableOpacity>


          {/* Left Side: Weather & Air Quality */}
          <TouchableOpacity onPress={() => setShowWeather((prev) => !prev)}style={styles.weatherContainer}>
            {
              showWeather ?
              <Image style={styles.weatherIconImage} source={{ uri: `https://openweathermap.org/img/wn/${weatherIcon}@2x.png` }}/>:
              <Text style={styles.aqiText(aqiValue)}> {aqiValue} </Text>
            }
            <Text style={styles.weatherText}>{showWeather ? weatherValue : "AQI"}</Text>
          </TouchableOpacity>


        </View>

      {/* Body Temperature & Air Quality */}
      <View style={styles.sensorContainer}>
        <Text style={styles.label}>
          Temperature: {isNaN(bodyTemperature) ? "N/A" : bodyTemperature.toFixed(1)}°C
        </Text>


      {/* Temperature Bar with Gradient */}
      <View style={[styles.barContainer, { width: barWidth }]}>
        <LinearGradient
          colors={['#ffb3b3', '#c2f0c2', '#ffb3b3']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientBar}
        />
          {/* Circle Indicator */}
          <View style={[styles.indicator, { left: indicatorPosition - 10 }]} />
        </View>

        {/* Min & Max Labels */}
        <View style={[styles.labelsContainer, { width: barWidth }]}>
          <Text style={styles.minMaxLabel}>{minTemp}°C</Text>
          <Text style={styles.minMaxLabel}>{maxTemp}°C</Text>
        </View>
      </View>

      <View style={{ marginTop: 20, marginBottom: 30 }}>

      {/* Step History */}
      <View style={{ marginBottom: 30 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Caloric History
        </Text>
        <BarChart
          data={{
            labels: caloricLabels,
            datasets: [{ data: caloricDataValues }],
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          style={{ borderRadius: 8,
            alignSelf: "center", // Ensures the chart is centered
            marginLeft: 20, // Pushes graph slightly to the right to compensate for label space
            marginRight: 20, // Pushes graph slightly to the left to balance spacing
          }}
        />
      </View>

      {/* Body Temperature Trend */}
      <View>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Body Temperature Trend
        </Text>
        <LineChart
          data={{
            labels:  Array.isArray(tempLabels) && tempLabels.length > 0 ? tempLabels : ["12:00", "13:00", "14:00", "15:00", "16:00", "17:00"],
            datasets: [{
              data: Array.isArray(tempDataValues) && tempDataValues.length > 0
                ? tempDataValues.map(value => (isNaN(value) || !isFinite(value) ? 0 : value)) 
                : [38.5, 38.6, 38.4, 38.3, 38.2, 38.1]
            }]
          }}
          width={screenWidth - 40}
          height={220}
          yAxisLabel=""
          chartConfig={chartConfig}
          bezier
          style={{ borderRadius: 8 }}
        />
      </View>
    </View>
      </ScrollView>
</View>
  );
};

const getAqiColor = (aqi) => {
  const colors = {
    1: '#2ECC71', // Green (Good)
    2: '#27AE60', // Light Green
    3: '#F1C40F', // Yellow
    4: '#E67E22', // Orange
    5: '#C0392B', // Red (Poor)
  };
  return colors[aqi] || '#2C3E50'; // Default color (if aqi is out of range)
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9"},
  dataContainer: {
    flexDirection: 'row',
    alignItems: 'stretch', // Ensures both containers have the same height
    paddingHorizontal: 0,
    marginTop:20,
  },
  statusContainer: {
    flex: 0.35, // 35% of the width
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginRight: 15,
  },
  statusIcon: {
    marginBottom: 5, // Space between icon and text
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  caloriesContainer: {
    flex: 0.62, // 65% of the width
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#FDEDEC',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E74C3C',
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#C0392B',
  },
  distanceContainer: {
    flex: 0.62,
    paddingVertical: 18,
    paddingHorizontal: 22,
    backgroundColor: '#EAF2F8',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  distanceLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2471A3',
  },
  distanceValue: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1B4F72',
  },
  weatherContainer: {
    flex: 0.35,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    backgroundColor: '#FDFEFE',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
  },
  weatherIconImage: {
    width: 35,
    height: 35,
  },
  weatherText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#34495E',
  },
  aqiText: (aqi) => ({
    fontSize: 28,
    fontWeight: '700',
    color: getAqiColor(aqi),
  }),
  sensorContainer: {
    justifyContent: "space-between",
    marginTop: 20,
    alignItems: "center",
    borderRadius: 10,
    backgroundColor: "#F8F9FA",
    // marginBottom: 20,
    padding: 15,
    elevation: 3,
  },
  sensorBox: {
    width: "100%",
    backgroundColor: "#ffe0b2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 0,
    paddingBottom: 70,
  },
  scrollView: { paddingHorizontal: 20, marginTop: 50 },
  name: { fontSize: 22, fontWeight: "bold", textAlign: "center"},
  backButton: { position: "absolute", zIndex: 10, top: 15, left: 15, padding: 10, backgroundColor: "#2980b9", borderRadius:50 },
  overlay: { position: "absolute", height: 160, width: 300, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "transparent" },
  deleteButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 100,
    elevation: 10,
    backgroundColor: "#FF6347",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sleepContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D6EAF8",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    justifyContent: "flex-start",
  },
  sleepIcon: {
    marginRight: 20,
  },
  sleepText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  confirmButton: {
    backgroundColor: "red",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  barContainer: {
    height: 25,
    borderRadius: 12.5,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0', // Soft background
  },
  gradientBar: {
    height: '100%',
    width: '100%',
  },
  indicator: {
    position: 'absolute',
    top: '50%', // Center vertically
    transform: [{ translateY: -10 }], // Adjust for perfect center
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#333', // Darker for contrast
    borderWidth: 3,
    borderColor: '#fff', // White border for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  minMaxLabel: {
    fontSize: 14,
    color: '#555',
  },
});

export default PetDetails;

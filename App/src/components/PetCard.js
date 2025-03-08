import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Import icons

export const PetCard = ({ pet }) => {
  const navigation = useNavigation();

  const batteryLevel = Math.floor(Math.random() * (100 - 20 + 1) + 20); // Place holder battery value (proof of concept)

  const handlePress = () => {
    navigation.navigate("PetDetails", { pet });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      {/* Pet Type Icon */}
      <View style={styles.iconContainer}>
        <Icon name={pet.type === "Dog" ? "dog" : "cat"} size={40} color="#007AFF" />
      </View>

      {/* Pet Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{pet.name}</Text>
        <Text style={styles.details}>Type: {pet.type}</Text>
        <Text style={styles.details}>Collar ID: {pet.collarId}</Text>

        {/* Battery Indicator */}
        <View style={styles.batteryContainer}>
          <Icon name="battery" size={20} color="#007AFF" />
          <View style={styles.batteryBar}>
            <View
              style={[
                styles.batteryFill,
                { width: `${batteryLevel}%`, backgroundColor: getBatteryColor(batteryLevel) },
              ]}
            />
          </View>
          <Text style={styles.batteryText}>{batteryLevel}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Function to determine battery color based on level
const getBatteryColor = (level) => {
  if (level > 50) return "#4CAF50"; // Green
  if (level > 20) return "#FFC107"; // Yellow
  return "#F44336"; // Red
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 15,
    marginVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#E0F2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  details: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  batteryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  batteryBar: {
    width: 80,
    height: 10,
    backgroundColor: "#EEE",
    borderRadius: 5,
    overflow: "hidden",
    marginHorizontal: 6,
  },
  batteryFill: {
    height: "100%",
    borderRadius: 5,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
  },
});

export default PetCard;

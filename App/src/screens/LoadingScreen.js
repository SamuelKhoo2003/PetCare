import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  Animated,
} from "react-native";

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity = 0

  useEffect(() => {
    // Start fade-in animation
    Animated.timing(fadeAnim, {
      toValue: 1, // Fade to opacity 1
      duration: 1500, // 1.5 seconds fade-in
      useNativeDriver: true,
    }).start();

    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Show the loading screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Fade-in Logo */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image source={require("../assets/logo1.png")} style={styles.logo} />
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[styles.title, { opacity: fadeAnim }]}>
          Welcome to PetCare
        </Animated.Text>

        {/* Loading Spinner */}
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 15,
  },
});


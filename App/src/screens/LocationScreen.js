import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, Alert, TouchableOpacity, FlatList } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import { loadUserFromStorage } from '../utils/storage';
import { getUserData, getCollarData } from '../utils/firebaseDatabase';

export default function LocationScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pets, setPets] = useState([]);
  const webviewRef = useRef(null);

  const fetchPetLocation = (collarId) => {
    return new Promise((resolve, reject) => {
      getCollarData(collarId, (collarData) => {
        if (collarData) {
          resolve({ latitude: collarData.latitude, longitude: collarData.longitude });
        } else {
          reject(new Error(`No location data found for collarId: ${collarId}`));
        }
      });
    });
  };
  

  const loadPets = async () => {
    try {
      const user = await loadUserFromStorage();
      console.log("User UID:", user.uid);
  
      const userData = await getUserData(user.uid);
      const petData = userData.pets;
  
      if (petData) {
        const petsArray = await Promise.all(
          Object.keys(petData).map(async (collarId) => {
            const pet = { collarId, ...petData[collarId] };
  
            try {
              const locationData = await fetchPetLocation(collarId);
              return { ...pet, latitude: locationData.latitude, longitude: locationData.longitude };
            } catch (error) {
              console.error(`Error fetching location for collarId ${collarId}:`, error);
              return { ...pet, latitude: null, longitude: null };
            }
          })
        );
  
        console.log("Pets Loaded with Locations:", petsArray);
        setPets(petsArray);
      }
    } catch (error) {
      console.error("Error loading pets:", error);
    }
  };
  

  useEffect(() => {
    console.log("WebView is mounting...");
    const getLocation = async () => {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in app settings.');
        setError('Location permission denied');
        setLoading(false);
        return;
      }

      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (err) {
        Alert.alert('Error', `Failed to get location: ${err.message}`);
        setError(`Failed to fetch location: ${err.message}`);
      }

      setLoading(false);
    };

    getLocation();
    loadPets();
  }, []);

  const mapHtml = (lat, lon, pets) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
        <title>Pet Map</title>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
        <style>
            html, body { margin: 0; padding: 0; height: 100%; width: 100%; overflow: hidden; }
            #map { width: 100%; height: 100vh; }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function () {
                var map = L.map('map', {
                    center: [${lat}, ${lon}], 
                    zoom: 14,
                    zoomControl: true,
                    dragging: true,
                    touchZoom: true,
                    scrollWheelZoom: true,
                    doubleClickZoom: true,
                    boxZoom: true
                });

                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '&copy; OpenStreetMap contributors',
                    maxZoom: 19,
                    detectRetina: true
                }).addTo(map);

                L.circleMarker([${lat}, ${lon}], {
                    radius: 8,
                    color: 'blue',
                    fillColor: 'blue',
                    fillOpacity: 0.6
                }).addTo(map)
                .bindPopup('Your Location')
                .openPopup();

                const pets = ${JSON.stringify(pets)};
                pets.forEach(pet => {
                    if (!pet.latitude || !pet.longitude) return;

                    let iconHtml = \`
                      <div style="
                          width: 50px; 
                          height: 50px; 
                          border-radius: 50%;
                          display: flex; 
                          align-items: center;
                          justify-content: center;
                          background: white;
                          border: 2px solid white;
                          box-shadow: 2px 4px 6px rgba(0,0,0,0.2);
                          overflow: hidden;
                      ">
                          <img src="\${pet.type === "Dog" ? "https://cdn-icons-png.flaticon.com/128/616/616408.png" : "https://cdn-icons-png.flaticon.com/128/616/616430.png"}" 
                              width="100%" height="100%" style="
                                  border-radius: 50%;
                                  object-fit: cover;
                                  display: block;
                                  background: transparent;
                          "/>
                      </div>
                    \`;

                    let customIcon = L.divIcon({
                        html: iconHtml,
                        className: "", // ✅ Removes any default Leaflet styling
                        iconSize: [50, 50], 
                        iconAnchor: [25, 25], 
                        popupAnchor: [0, -25]
                    });


                    let marker = L.marker([pet.latitude, pet.longitude], { icon: customIcon }).addTo(map)
                    .bindPopup("<b>" + pet.name + "</b>");

                    marker.on('click', function() {
                        window.ReactNativeWebView.postMessage(JSON.stringify(pet));
                        map.setView([pet.latitude, pet.longitude], 18);
                    });
                });

                window.zoomToPet = function(lat, lon) {
                    map.setView([lat, lon], 15);
                };
            });
        </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="teal" />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <>
          <WebView 
            ref={webviewRef}
            key={`${userLocation?.latitude}-${userLocation?.longitude}`}
            originWhitelist={['*']}
            source={{ html: userLocation ? mapHtml(userLocation.latitude, userLocation.longitude, pets) : "<h1>Loading...</h1>" }}
            style={styles.webView}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />

          <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
            <Icon name="paw" size={30} color="white" />
          </TouchableOpacity>

          <Modal 
            isVisible={modalVisible} 
            swipeDirection="down"
            onSwipeComplete={() => setModalVisible(false)}
            onBackdropPress={() => setModalVisible(false)}
            style={styles.modal}
          >
            <View style={styles.modalContent}>
            <FlatList
              data={[{ name: "Your Location", latitude: userLocation?.latitude, longitude: userLocation?.longitude, type: "location" }, ...pets]}
              keyExtractor={(item, index) => item.collarId || `location-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.petItem}
                  onPress={() => {
                    webviewRef.current.injectJavaScript(`window.zoomToPet(${item.latitude}, ${item.longitude})`);
                    setModalVisible(false);
                  }}
                >
                  <Icon name={item.type === "Dog" ? "dog" : item.type === "Cat" ? "cat" : "map-marker"} size={30} color={item.type === "location" ? "red" : "#007AFF"} />
                  <Text style={styles.petName}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />

            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "white" 
  },
  webView: { 
    flex: 1, 
    width: "100%", 
    height: "100%" 
  }, 
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30, // ✅ Ensures a perfect circle
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000", // ✅ Adds a subtle shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modal: { 
    justifyContent: "flex-end", 
    margin: 0 
  },
  modalContent: { 
    backgroundColor: "white", 
    padding: 20, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  petItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 10 
  },
  petName: { 
    marginLeft: 10, 
    fontSize: 18 
  },
  petIconContainer: { // ✅ Ensures pet icons are circular
    width: 50,
    height: 50,
    // borderRadius: 25, // ✅ Makes the icon circular
    overflow: "hidden", // ✅ Ensures image does not spill over
    justifyContent: "center",
    alignItems: "center",
  },
  petIcon: { 
    width: "100%", 
    height: "100%", 
    borderRadius: 25, // ✅ Ensures a circular image
  },
});


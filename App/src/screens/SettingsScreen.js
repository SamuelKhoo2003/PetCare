import React, {useEffect} from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Updates from "expo-updates";
import { logout, deleteUserAccount } from '../utils/auth';
import { removeUserFromStorage } from '../utils/storage';
import { loadUserFromStorage } from '../utils/storage';
import { getUserData } from '../utils/firebaseDatabase';

// Handle app restart after logout or delete
const handleRestart = async () => {
  await Updates.reloadAsync();
};

// Logout functionality
const onLogout = async () => {
  try {
    await logout(); // Log out the user
    await removeUserFromStorage(); // Remove user data from AsyncStorage
    console.log("User logged out successfully");
    await handleRestart(); // Restart the app
  } catch (error) {
    console.error("Logout failed: ", error.message);
    alert("Logout failed. Please try again.");
  }
};

// Delete user account functionality with confirmation
const onDeleteUser = async () => {
  Alert.alert(
    "Delete Account",
    "Are you sure you want to delete your account? This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteUserAccount();
            console.log("User account deleted successfully");
            await handleRestart(); // Restart the app after deletion
          } catch (error) {
            console.log("Delete User failed: ", error.message);
            alert("Account deletion failed. Please try again.");
          }
        }
      }
    ],
    { cancelable: true }
  );
};


export default function SettingsScreen() {
  const [userData, setUserData] = React.useState({});
  const loadUser = async () => { 
    try{
      const user = await loadUserFromStorage();
      console.log("User loaded successfully:", user);
      const userData = await getUserData(user.uid);
      console.log("User data loaded successfully:", userData);
      setUserData(userData);
      return userData;
    } catch (error) { 
      console.error("Error loading user:", error);
    }
  };
  useEffect (() => {
    loadUser();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>App Version</Text>
        <Text style={styles.infoText}>1.0.0</Text>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>User Information</Text>
        <Text style={styles.infoText}>{userData.firstname} {userData.lastname}</Text>
        <Text style={styles.infoText}>{userData.email}</Text>
        
      </View>

      <TouchableOpacity style={styles.buttonLogout} onPress={onLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.buttonDelete} onPress={onDeleteUser}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
  },
  buttonLogout: {
    backgroundColor: '#2ec7b1',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  buttonDelete: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

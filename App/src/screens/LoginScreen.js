import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, Image, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, emailVerification } from '../utils/auth';
import { loadUserFromStorage, saveUserToStorage } from '../utils/storage';

const { width, height } = Dimensions.get('window');


export default function LoginScreen({ navigation, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  // To show loading during login
  const [showEmailMessage, setShowEmailMessage] = useState(false);  // Email verification message

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        savedUserFlag = await loadUserFromStorage();
        if (savedUserFlag != null) {
          console.log("Auto-login");
          onLogin(); // Skip login screen
        } else {
          console.log("No saved credentials, showing login screen.");
        }
      } catch (error) {
        console.error("Error retrieving credentials:", error);
      }
    };

    (async () => {
      await checkLoginStatus(); // ✅ Now it's correctly awaited
    })();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true); // Start loading

    try {
      const user = await login(username, password);
      if (user) {
        if (!user.emailVerified) {
          setShowEmailMessage(true);  // Show email verification message
          await emailVerification();
          setLoading(false);
        } else {
          await saveUserToStorage(JSON.stringify(user));
          onLogin();
        }
      }
    } catch (error) {
      setLoading(false);  // Stop loading in case of error
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        alert("Invalid email or password");
      } else if (error.code === "auth/too-many-requests") {
        alert("Too many failed login attempts. Please try again later."); 
      } else {
        console.log(error);
        alert("Something went wrong. Please try again later.");
      }
    }
  };

  return (
    <ImageBackground source={require('../assets/background.jpg')} style={styles.background}>
      <View style={styles.container}>
        <Image source={require('../assets/logo1.png')} style={styles.logo} resizeMode="contain" />
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Logging In...' : 'Sign In'}</Text>
        </TouchableOpacity>

        {showEmailMessage && (
          <Text style={styles.emailMessage}>
            Please verify your email. A verification link has been sent.
          </Text>
        )}
        
        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
          <Text style={styles.separatorText}>or</Text>
          <View style={styles.separator} />
        </View>
        
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  input: {
    width: '90%',
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  button: {
    width: '90%',
    paddingVertical: 12,
    backgroundColor: '#2ec7b1',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
  },
  registerButton: {
    backgroundColor: '#229b89',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailMessage: {
    marginVertical: 10,
    color: 'red',
    fontSize: 14,
    fontStyle: 'italic',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#000001',
  },
  separatorText: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#888',
  },
});

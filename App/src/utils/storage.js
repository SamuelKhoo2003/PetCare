import AsyncStorage from '@react-native-async-storage/async-storage';

// Save user data to AsyncStorage
export const saveUserToStorage = async (username) => {
  try {
    await AsyncStorage.setItem('loggedInUser', username);
  } catch (e) {
    console.error('Failed to save user data:', e);
  }
};

// Load user data from AsyncStorage
export const loadUserFromStorage = async () => {
  try {
    const user = await AsyncStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    console.error('Failed to load user data:', e);
    return null;
  }
};

// Remove user data from AsyncStorage (e.g., for logout)
export const removeUserFromStorage = async () => {
  try {
    await AsyncStorage.removeItem('loggedInUser');
  } catch (e) {
    console.error('Failed to remove user data:', e);
  }
};

import { getDatabase, ref, set, get, remove, onValue} from 'firebase/database';

const database = getDatabase();

// Save user data in Firebase Realtime Database
export const saveUserData = async (userId, firstName, lastName, email) => {
  try {
    await set(ref(database, `users/${userId}`), {
      firstname: firstName,
      lastname: lastName,
      email: email,
      createdAt: new Date().toISOString(),
    });
    console.log('User data saved successfully.');
  } catch (error) {
    console.error('Error saving user data:', error.message);
    throw error;
  }
};

export const getUserData = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('No user data found.');
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error.message);
    throw error;
  }
}

export const createPetData = async (userId, collarId, petName, petType) => {
  try {
    console.log(petName, petType);
    await set(ref(database, `users/${userId}/pets/${collarId}`), {
      name: petName,
      type: petType,
      createdAt: new Date().toISOString(),
    });
    console.log('Pet data saved successfully.');
  } catch (error) {
    console.error('Error saving pet data:', error.message);
    throw error;
  }
};

export const deletePetData = async (userId, collarId) => {
  try {
    await remove(ref(database, `users/${userId}/pets/${collarId}`)); // Completely deletes the collarId node
    console.log("Pet data deleted successfully.");
  } catch (error) {
    console.error("Error deleting pet data:", error.message);
    throw error;
  }
};

export const getCollarData = async (collarId, callback) => {
  try {
    const db = getDatabase();
    const collarRef = ref(db, `collars/${collarId}`);

    onValue(collarRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val()); // Pass the data to the callback function
      } else {
        console.log("No data available");
        callback(null);
      }
    });
  } catch (error) {
    console.error("Error getting collar data:", error.message);
  }
};
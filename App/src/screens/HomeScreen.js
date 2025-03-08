import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import PetCard from '../components/PetCard';
import { createPetData, getUserData } from '../utils/firebaseDatabase';
import { loadUserFromStorage } from '../utils/storage';
import GestureRecognizer from "react-native-swipe-gestures";
import { db } from "../utils/firebaseConfig"
import { ref, get} from "firebase/database"

export default function HomeScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [pets, setPets] = useState([]); // Store pets in the state
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('Dog'); // Default to Dog
  const [collarId, setCollarId] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadPets = async () => {
    try {
      setRefreshing(true);
      const user = await loadUserFromStorage();
      console.log(user.uid);
      const userData = await getUserData(user.uid);
      const petData = userData.pets; // Assuming this is an object with collarIds as keys

      if (petData) {
        // Convert petData object to an array
        const petsArray = Object.keys(petData).map(collarId => ({
          collarId,
          ...petData[collarId]
        }));
        setPets(petsArray);
      }
    } catch (error) {
      console.error("Error loading pets:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, []);

  const addPet = async () => {
    try {
      const user = await loadUserFromStorage();
      console.log(user.uid);
      // Check if collarId exists in Firebase
      const collarRef = ref(db, `/collars/${collarId}`);
      const collarSnapshot = await get(collarRef);
      if (!collarSnapshot.exists()) {
        console.error('Error: Collar ID does not exist.');
        alert('The entered Collar ID does not exist. Please enter a valid one.');
        return;
      }
      // Collar ID exists, proceed with adding pet
      await createPetData(user.uid, collarId, petName, petType);
      // Reset Input Boxes
      setPetName('');
      setPetType('Dog');
      setCollarId('');
      setModalVisible(false);
      loadPets();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };


  const onCancel = () => {
    setPetName('');
    setPetType('Dog');
    setCollarId('');
    setModalVisible(false);
  };

  return (
    <GestureRecognizer
      onSwipeUp={loadPets} // Reload pets when swiping up
      style={{ flex: 1, padding: 0 }}
    >
      <ImageBackground
        source={require('../assets/background.jpg')}
        style={styles.background}
      >
        <View style={styles.container}>
          <Text style={styles.title}>My Pets</Text>

          {/* Floating Add Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>

          {/* FlatList of Pets */}
          <FlatList
            data={pets}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => <PetCard pet={item} />}
            contentContainerStyle={styles.petListContainer}
            style={{ flex: 1, width: '90%' }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={loadPets} />
            }
          />
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            {/* Main Content Wrapper */}
            <View style={styles.modalContentWrapper}>
              {/* Scrollable Content */}
              <View contentContainerStyle={styles.modalContent}>
                <Text style={styles.modalTitle}>Add a New Pet</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Enter pet name"
                  value={petName}
                  onChangeText={setPetName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter collar ID"
                  value={collarId}
                  onChangeText={setCollarId}
                />

                <View style={styles.dropdownContainer}>
                  <Text style={styles.dropdownLabel}>Select Pet Type:</Text>
                  <Picker
                    selectedValue={petType}
                    onValueChange={(itemValue) => setPetType(itemValue)}
                    style={styles.picker}
                    mode="dropdown"
                  >
                    <Picker.Item label="Dog" value="Dog" />
                    <Picker.Item label="Cat" value="Cat" />
                  </Picker>
                </View>
              </View>

              {/* Layered Floating Buttons */}
              <TouchableOpacity style={styles.addPetButton} onPress={addPet}>
                <Text style={styles.addPetButtonText}>Add Pet</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={() => onCancel()}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        </View>
      </ImageBackground>
    </GestureRecognizer>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 35,
    color: '#00000',
    alignSelf: 'flex-start', // Ensures it aligns to the left
    textAlign: 'left', // Explicitly sets left alignment
    marginLeft: 20, // Optional: Adds some left margin
  },
  addButton: {
    position: 'absolute',  // Ensures it floats
    bottom: 20,
    right: 20,
    zIndex: 100, // 👈 Ensures it's above everything
    elevation: 10, // 👈 Android fix for layering issues
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  petListContainer: {
    flexGrow: 1,
    alignContent: 'center',
    marginTop: 20,
    width: '100%', // Ensure it takes full width
    height: 'max-content', // Ensure it takes full height
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContentWrapper: {
    width: '85%', // Make the modal larger
    maxHeight: '75%', // Allow more space
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalContent: {
    width: '100%', // Ensures full width usage
    paddingBottom: 20, 
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    alignSelf: 'center',
  },
  inputContainer: {
    width: '90%', // Container to ensure width consistency
  },
  input: {
    width: 300, // Take full width of container
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 15,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  dropdownContainer: {
    // flexGrow: 1,
  //   width: '100%', // Match input field width
    marginBottom: 15, 
    // height: 55,
  },
  dropdownLabel: {
    // fontSize: 18,
    // fontWeight: 'bold',
    // marginBottom: 5,
    // alignSelf: 'flex-start',
    height: 20, 
  },
  pickerWrapper: {
    width: '100%', // Ensure the picker takes up full width
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  picker: {
    width: '100%', // Ensure it stretches across
    // height: 30, 
  },
  addPetButton: {
    width: '90%', // Match width of inputs
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addPetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  cancelButton: {
    width: '90%', // Keep width consistent
    marginTop: 15,
    alignItems: 'center',
    padding: 14,
  },
  cancelButtonText: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

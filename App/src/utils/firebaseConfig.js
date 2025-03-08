import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDQ0cAZLEpIsmM3EoSdpOlX1U185U48zuY",
  authDomain: "petcare-2025.firebaseapp.com",
  databaseURL: "https://petcare-2025-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "petcare-2025",
  storageBucket: "petcare-2025.firebasestorage.app",
  messagingSenderId: "477072945283",
  appId: "1:477072945283:web:14efb3197d08d92f39abb6",
  measurementId: "G-WWN6MX7STJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);


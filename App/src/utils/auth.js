import { auth, db } from "../utils/firebaseConfig";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    deleteUser,
} from "firebase/auth";
import { ref, get, remove } from "firebase/database";
import { saveUserData } from "./firebaseDatabase";  // Import to avoid duplicate functions

// Signup Function
export const signup = async (email, password, firstName, lastName) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Save user info in Firebase Realtime Database
        await saveUserData(user.uid, firstName, lastName, email);

        // Send email verification
        await emailVerification();

        console.log("User registered successfully:", user);
        return user;
    } catch (error) {
        console.error("Signup Error:", error.message);
        throw error;
    }
};

// Login Function
export const login = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Firebase Realtime Database
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
            console.log("User data:", snapshot.val());
        } else {
            console.log("No user data found!");
        }

        console.log("User signed in:", user);
        return user;
    } catch (error) {
        console.error("Login Error:", error.message);
        throw error;
    }
};

export const emailVerification = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("No authenticated user found.");
        return;
    }

    try {
        // Send the email verification link to the user
        await sendEmailVerification(user, {
            handleCodeInApp: true, // No in-app handling of the code
            url: 'https://petcare-2025.web.app/', // Replace with your own URL
        });

        console.log(`Verification email sent to ${user.email}`);
    } catch (error) {
        console.error("Email Verification Error:", error.message);
        throw error;
    }
};

// Password Reset Function
export const resetPassword = async (email) => {
    try {
        // Send password reset email
        await sendPasswordResetEmail(auth, email);
        console.log(`Password reset email sent to ${email}`);
        return true;  // Return true to indicate the email was sent successfully
    } catch (error) {
        console.error("Password Reset Error:", error.message);
        throw error; // Rethrow the error to handle it in the calling function
    }
};

// Logout Function
export const logout = async () => {
    try {
        await signOut(auth);  // Sign out the user
        console.log("User logged out successfully");
        return true;  // Return true to indicate successful logout
    } catch (error) {
        console.error("Logout Error:", error.message);
        throw error; // Rethrow the error if something goes wrong
    }
};

// Delete User Function
export const deleteUserAccount = async () => {
    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("No authenticated user found.");
        }

        // First, remove user data from Realtime Database
        const userRef = ref(db, `users/${user.uid}`);
        await remove(userRef);
        console.log("User data removed from Realtime Database");

        // Then, delete the user from Firebase Auth
        await deleteUser(user);
        console.log("User account deleted successfully");

        return true;  // Return true to indicate success
    } catch (error) {
        console.error("Delete User Error:", error.message);
        throw error;  // Rethrow the error for further handling
    }
};
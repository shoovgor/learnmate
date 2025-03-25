import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDBjZcqtHnwlcVZWZvPxK2cKzxPdU508Sg",
    authDomain: "edusync-444d5.firebaseapp.com",
    projectId: "edusync-444d5",
    storageBucket: "edusync-444d5.appspot.com",
    messagingSenderId: "860444079403",
    appId: "1:860444079403:web:abf54f176c451ef5cb816e",
    measurementId: "G-76TQNL14ZP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set persistence to local (browser) to keep users logged in
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Firebase persistence set to local");
  })
  .catch((error) => {
    console.error("Firebase persistence error:", error);
  });

// Auth state listener to store login state in localStorage and save to Firestore
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    localStorage.setItem('isLoggedIn', 'true');
    
    // Store user data in localStorage
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
    };
    
    // Check if we have existing userData with additional fields we want to keep
    try {
      const existingUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      // Merge existing data with current auth data (auth data takes precedence)
      const mergedData = { ...existingUserData, ...userData };
      localStorage.setItem('userData', JSON.stringify(mergedData));
    } catch (e) {
      // If parsing fails, just store the basic user data
      localStorage.setItem('userData', JSON.stringify(userData));
    }
  } else {
    // User is signed out
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userData');
    localStorage.removeItem('isTeacher');
  }
});

export default app;

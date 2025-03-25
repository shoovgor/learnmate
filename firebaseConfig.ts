// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { Auth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDBjZcqtHnwlcVZWZvPxK2cKzxPdU508Sg",
  authDomain: "edusync-444d5.firebaseapp.com",
  projectId: "edusync-444d5",
  storageBucket: "edusync-444d5.firebasestorage.app",
  messagingSenderId: "860444079403",
  appId: "1:860444079403:web:abf54f176c451ef5cb816e",
  measurementId: "G-76TQNL14ZP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDBjZcqtHnwlcVZWZvPxK2cKzxPdU508Sg",
    authDomain: "edusync-444d5.firebaseapp.com",
    projectId: "edusync-444d5",
    storageBucket: "edusync-444d5.appspot.com", // Fixed storage bucket URL
    messagingSenderId: "860444079403",
    appId: "1:860444079403:web:abf54f176c451ef5cb816e",
    measurementId: "G-76TQNL14ZP"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
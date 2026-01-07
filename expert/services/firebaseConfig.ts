// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// REPLACE these values with your actual config from Firebase Console -> Project Settings
const firebaseConfig = {
    apiKey: "AIzaSyA2RoB6ElxZFdEwuvwjCfH8wV-ahr1HuIM",
    authDomain: "shonali-desh-19ead.firebaseapp.com",
    databaseURL: "https://shonali-desh-19ead-default-rtdb.firebaseio.com",
    projectId: "shonali-desh-19ead",
    storageBucket: "shonali-desh-19ead.firebasestorage.app",
    messagingSenderId: "755018107118",
    appId: "1:755018107118:web:a3705ae82bcc1ed4518bff",
    measurementId: "G-JBYJ1DVFXK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and Storage
export const db = getDatabase(app);
export const storage = getStorage(app);

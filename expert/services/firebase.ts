import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };

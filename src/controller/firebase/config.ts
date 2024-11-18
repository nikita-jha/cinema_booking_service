// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAq8phusbYmmhrZIiVUm2bLMoTcBrdFyvA",
    authDomain: "cinema-booking-service-2cacb.firebaseapp.com",
    projectId: "cinema-booking-service-2cacb",
    storageBucket: "cinema-booking-service-2cacb.appspot.com",
    messagingSenderId: "198283832967",
    appId: "1:198283832967:web:3acf74ea7e3ba26d375222",
    measurementId: "G-DV15C82K3N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Conditionally initialize analytics only in the browser
let analytics;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
        analytics = getAnalytics(app);
    }
    });
}

export const db = getFirestore(app);
export const auth = getAuth(app);
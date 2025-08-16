// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDB3vsCg_Hs-HDRgCjhH3IlSHygaEa0iFA",
  authDomain: "bust-all-over-my-face.firebaseapp.com",
  projectId: "bust-all-over-my-face",
  storageBucket: "bust-all-over-my-face.firebasestorage.app",
  messagingSenderId: "795972389742",
  appId: "1:795972389742:web:3e1da102065ddb91f78f7f",
  measurementId: "G-BGNPK1ESZJ",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log(app.name);

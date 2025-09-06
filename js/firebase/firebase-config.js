// ✅ Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// ✅ Auth & Firestore
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ Optional: Analytics (only works on https + with proper Firebase hosting)
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDB3vsCg_Hs-HDRgCjhH3IlSHygaEa0iFA",
  authDomain: "bust-all-over-my-face.firebaseapp.com",
  projectId: "bust-all-over-my-face",
  storageBucket: "bust-all-over-my-face.appspot.com",
  messagingSenderId: "795972389742",
  appId: "1:795972389742:web:3e1da102065ddb91f78f7f",
  measurementId: "G-BGNPK1ESZJ",
};

// 🔥 Initialize
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ✅ Analytics (optional, safe to ignore on localhost)
let analytics = null;
try {
  analytics = getAnalytics(app);
  console.log("Analytics initialized ✅");
} catch (err) {
  console.warn("Analytics not supported in this environment:", err.message);
}

console.log("Firebase initialized:", app.name);

export { analytics };

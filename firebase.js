// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-ec1LP3M04-diwcNijQV2W4dbSecYwnw",
  authDomain: "prompt-wars-65644.firebaseapp.com",
  projectId: "prompt-wars-65644",
  storageBucket: "prompt-wars-65644.firebasestorage.app",
  messagingSenderId: "213086307782",
  appId: "1:213086307782:web:24890b15db501e72451ec7",
  measurementId: "G-Z4MN2FVJVF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence setup failed:", error);
});

// Initialize Firestore
const db = getFirestore(app);

// Export
export { auth, db };
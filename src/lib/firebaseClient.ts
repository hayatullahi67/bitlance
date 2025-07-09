// src/lib/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCtp0NTc0HbO0pjMsMfB_m9ffMX03fFtZ0",
  authDomain: "skillproof-fb3c4.firebaseapp.com",
  databaseURL: "https://skillproof-fb3c4-default-rtdb.firebaseio.com",
  projectId: "skillproof-fb3c4",
  storageBucket: "skillproof-fb3c4.firebasestorage.app",
  messagingSenderId: "514462914978",
  appId: "1:514462914978:web:829035020c870d17d1bafb",
  measurementId: "G-QR88ZG3J5K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only in browser environment
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn('Analytics initialization failed:', error);
  }
}
export { analytics }; 
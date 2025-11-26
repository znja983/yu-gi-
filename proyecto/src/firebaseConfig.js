// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4Z4woZXqyIA0BN1xsnohmLmHVjj54t7A",
  authDomain: "yu-gi-oh-e1b24.firebaseapp.com",
  projectId: "yu-gi-oh-e1b24",
  storageBucket: "yu-gi-oh-e1b24.firebasestorage.app",
  messagingSenderId: "884949645800",
  appId: "1:884949645800:web:82e8a687398ed8abfd0c5d",
  measurementId: "G-0TQR50KQQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
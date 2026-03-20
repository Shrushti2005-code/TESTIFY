import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC8CcLt8gbpyc8M3xr8ZSCxNeCccm2rUOc",
  authDomain: "simple-flutter-d88c7.firebaseapp.com",
  projectId: "simple-flutter-d88c7",
  storageBucket: "simple-flutter-d88c7.firebasestorage.app",
  messagingSenderId: "587339609841",
  appId: "1:587339609841:web:d3f435b89eff4f8ca55b50"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
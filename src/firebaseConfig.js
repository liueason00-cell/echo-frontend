// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDQJ7JBZOT4qGUaQ8C2-QvP6l4iKOeR11E",
  authDomain: "atomic-knowledge-hub.firebaseapp.com",
  projectId: "atomic-knowledge-hub",
  storageBucket: "atomic-knowledge-hub.firebasestorage.app",
  messagingSenderId: "222905357405",
  appId: "1:222905357405:web:42ead9bf4796b6c8d969b4",
  measurementId: "G-E4D9ZHZPZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
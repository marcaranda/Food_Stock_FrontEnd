// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoEnxY9D8A7SA3VmnSXw6R7d0Ij8CBlog",
  authDomain: "food-stock-330d6.firebaseapp.com",
  projectId: "food-stock-330d6",
  storageBucket: "food-stock-330d6.appspot.com",
  messagingSenderId: "1084904752158",
  appId: "1:1084904752158:web:232b2c809ce6186a239a0f",
  measurementId: "G-2LLLHN5VBP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
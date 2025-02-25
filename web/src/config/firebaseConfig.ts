import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBFG7RFSPGdA7bxIKcJxdap6v8lyKaKgE",
  authDomain: "office-pilot.firebaseapp.com",
  projectId: "office-pilot",
  storageBucket: "office-pilot.firebasestorage.app",
  messagingSenderId: "627687272994",
  appId: "1:627687272994:web:740bed9af9da78e523507b",
};

// אתחול Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "office-pilot-dev");

export { db };

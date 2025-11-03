import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDZeVGQPWX9KsDPblSite_MS1YSApowJ3o",
  authDomain: "math-catch.firebaseapp.com",
  databaseURL: "https://math-catch-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "math-catch",
  storageBucket: "math-catch.firebasestorage.app",
  messagingSenderId: "522664043207",
  appId: "1:522664043207:web:6a32a272662ec2d61d94e2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export database so your game can use it
export const database = getDatabase(app);
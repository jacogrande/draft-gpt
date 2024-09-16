import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAI6BxxoB1MlaBAzxcm-OgHqmU_br22JLs",
  authDomain: "draft-gpt-81aaa.firebaseapp.com",
  projectId: "draft-gpt-81aaa",
  storageBucket: "draft-gpt-81aaa.appspot.com",
  messagingSenderId: "665593482672",
  appId: "1:665593482672:web:7136dd3f7dcbdc3fd21a75",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();

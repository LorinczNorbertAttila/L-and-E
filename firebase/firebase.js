import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDZD_EvIzR2U0hsuHrBJfj4EHBGEVLKPgA",
  authDomain: "l-e-webshop.firebaseapp.com",
  databaseURL: "https://l-e-webshop-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "l-e-webshop",
  storageBucket: "l-e-webshop.appspot.com",
  messagingSenderId: "1034533686332",
  appId: "1:1034533686332:web:22fc6a7348510661478739",
  measurementId: "G-HHDPM58SND"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth();
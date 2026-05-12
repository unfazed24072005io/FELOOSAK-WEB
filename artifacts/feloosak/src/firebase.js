import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  doc, 
  setDoc 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAyWjZ6BfLPB5P5qlLwV0imWhZmT2VI3z0",
  authDomain: "upahar-bacb3.firebaseapp.com",
  databaseURL: "https://upahar-bacb3-default-rtdb.firebaseio.com",
  projectId: "upahar-bacb3",
  storageBucket: "upahar-bacb3.firebasestorage.app",
  messagingSenderId: "531294896795",
  appId: "1:531294896795:web:2f91ce751ba17a662afc3e",
  measurementId: "G-FLGNWVPVVD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  doc,
  setDoc
};
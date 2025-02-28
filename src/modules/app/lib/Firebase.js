import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


import { FirebaseConfig } from "../../../FirebaseConfig";


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase

const firebaseApp = initializeApp(FirebaseConfig);

const analytics = getAnalytics();

const auth = getAuth();

const firestore = getFirestore();

export default firebaseApp;
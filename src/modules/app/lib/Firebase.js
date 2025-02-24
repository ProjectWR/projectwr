import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

import { FirebaseConfig } from "../../../FirebaseConfig";


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries


// Initialize Firebase

const firebaseApp = initializeApp(FirebaseConfig);

const analytics = getAnalytics(firebaseApp);

const auth = getAuth();

export default firebaseApp;
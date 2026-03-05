import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDqJXbtmz6D1sGahFGW5Q9OVVwyeDxzvy8",
    authDomain: "neu-library-monitoring-system.firebaseapp.com",
    projectId: "neu-library-monitoring-system",
    storageBucket: "neu-library-monitoring-system.firebasestorage.app",
    messagingSenderId: "144765970483",
    appId: "1:144765970483:web:a1e44942c8769891fe9b46"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
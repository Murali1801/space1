import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBjwCxujyHmP184Loa4zH265rT7Znfq8wE",
    authDomain: "space-9e37e.firebaseapp.com",
    projectId: "space-9e37e",
    storageBucket: "space-9e37e.firebasestorage.app",
    messagingSenderId: "903114097206",
    appId: "1:903114097206:web:4f166eda7382a2abf34e97",
    measurementId: "G-0H45T7XVYR"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics conditionally (only in browser)
let analytics;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, db, analytics };

// Import the necessary Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAVozh5KfvxiKDOQ-A9d4UgwLf0hBlxym0",
    authDomain: "rtrg-aa8fd.firebaseapp.com",
    projectId: "rtrg-aa8fd",
    storageBucket: "rtrg-aa8fd.appspot.com",
    messagingSenderId: "323510812731",
    appId: "1:323510812731:web:e983320870e980b7699c1e",
    measurementId: "G-0YRY7XYZXW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export the Firestore database
export { db };

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, Database } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// --- ACTION REQUIRED ---
// Replace the following object with your project's own Firebase configuration
// from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSyCMBiQMli_o8TKLi3oWFtPZIappWakA5lE",
  authDomain: "thought-board-a935a.firebaseapp.com",
  databaseURL: "https://thought-board-a935a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "thought-board-a935a",
  storageBucket: "thought-board-a935a.appspot.com",
  messagingSenderId: "97870183497",
  appId: "1:97870183497:web:29c2fdb18ff5c42d6c1398"
};

// A check to see if the configuration has been changed from the placeholder.
export const isFirebaseConfigured = firebaseConfig.apiKey !== "AIzaSy...YOUR_KEY";

let db: Database | undefined;

// Only initialize Firebase if the configuration is provided.
if (isFirebaseConfigured) {
  try {
    const app = initializeApp(firebaseConfig);
    // Get a reference to the database service
    db = getDatabase(app);
  } catch (e) {
    console.error("Firebase initialization error. Please check your firebaseConfig.ts", e);
  }
} else {
  console.warn("Firebase is not configured. Please update firebaseConfig.ts with your project's credentials.");
}

export { db };
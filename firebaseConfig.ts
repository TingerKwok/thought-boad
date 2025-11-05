import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, Database } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// --- ACTION REQUIRED ---
// Replace the following object with your project's own Firebase configuration
// from the Firebase console.
const firebaseConfig = {
  apiKey: "AIzaSy...YOUR_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
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

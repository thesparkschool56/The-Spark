import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";
import * as dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const seedData = JSON.parse(fs.readFileSync('./firebase-seed-data.json', 'utf8'));

async function seed() {
  try {
    console.log("Starting Firebase database seed with real data...");
    // Update specific nodes instead of the entire root to preserve other existing data like admissions or scoreboard.
    for (const [key, value] of Object.entries(seedData)) {
      await set(ref(db, `/${key}`), value);
      console.log(`Seeded node: /${key}`);
    }
    console.log("Successfully pushed real seed data to Firebase Realtime Database!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed database:", err);
    process.exit(1);
  }
}

seed();

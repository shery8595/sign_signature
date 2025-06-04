// /api/signatures.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

let app;
let db;

try {
  // Initialize Firebase only if it hasn't been initialized
  if (!getApps().length) {
    console.log('Initializing Firebase app...');
    app = initializeApp(firebaseConfig);
  } else {
    console.log('Using existing Firebase app...');
    app = getApps()[0];
  }
  
  // Initialize Firestore
  console.log('Initializing Firestore...');
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
  throw new Error('Failed to initialize Firebase: ' + error.message);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log('Fetching signatures from Firestore...');
    const signaturesCollection = collection(db, "signatures");
    const snapshot = await getDocs(signaturesCollection);
    
    if (snapshot.empty) {
      console.log('No signatures found in the database');
      return res.status(200).json([]);
    }
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Found ${data.length} signatures`);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching signatures:', err);
    return res.status(500).json({ 
      error: "Failed to fetch signatures", 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

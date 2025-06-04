// /api/signatures.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

let app;
let db;

try {
  if (!getApps().length) {
    console.log('Initializing Firebase app with config:', firebaseConfig);
    app = initializeApp(firebaseConfig);
  } else {
    console.log('Using existing Firebase app:', getApps()[0].name);
    app = getApps()[0];
  }
  console.log('Firebase app initialized successfully');
  db = getFirestore(app);
  console.log('Firestore initialized successfully');
} catch (error) {
  console.error('Firebase initialization error:', error.message, error.code);
  throw new Error(`Failed to initialize Firebase: ${error.message} (Code: ${error.code})`);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log('Fetching signatures from Firestore...');
    const signaturesCollection = collection(db, "signatures");
    console.log('Querying signatures collection...');
    const snapshot = await getDocs(signaturesCollection);
    
    console.log('Snapshot retrieved, empty:', snapshot.empty);
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
    console.error('Error fetching signatures:', err.message, err.code, err.stack);
    return res.status(500).json({ 
      error: "Failed to fetch signatures", 
      details: err.message,
      code: err.code || 'UNKNOWN',
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
}

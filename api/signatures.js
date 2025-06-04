// /api/signatures.js
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
let db;
try {
  console.log('Initializing Firebase Admin...');
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: "signature-app-878a8",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  db = getFirestore();
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  throw new Error('Failed to initialize Firebase Admin: ' + error.message);
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log('Attempting to fetch signatures...');
    const signaturesCollection = db.collection("signatures");
    console.log('Collection reference created');
    
    const snapshot = await signaturesCollection.get();
    console.log('Snapshot retrieved');
    
    if (snapshot.empty) {
      console.log('No signatures found in the database');
      return res.status(200).json([]);
    }
    
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log(`Successfully retrieved ${data.length} signatures`);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Detailed error in signatures endpoint:', {
      message: err.message,
      stack: err.stack,
      code: err.code,
      name: err.name
    });
    
    return res.status(500).json({ 
      error: "Failed to fetch signatures", 
      details: err.message,
      code: err.code,
      name: err.name
    });
  }
}

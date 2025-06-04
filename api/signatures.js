// /api/signatures.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log('Fetching signatures from Firestore...');
    const snapshot = await getDocs(collection(db, "signatures"));
    const data = snapshot.docs.map(doc => doc.data());
    console.log('Found signatures:', data);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching signatures:', err);
    return res.status(500).json({ error: "Failed to fetch signatures", details: err.message });
  }
}

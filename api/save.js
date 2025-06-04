// /api/save.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { firebaseConfig } from "./firebase-config";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { name, pfp, signature } = req.body;

    if (!name || !pfp || !signature) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const docRef = await addDoc(collection(db, "signatures"), {
      name,
      pfp,
      signature,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({ success: true, id: docRef.id });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
}

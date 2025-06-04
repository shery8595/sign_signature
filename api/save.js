// pages/api/save.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyADd3GsMnoZuoltCFFXQWms4bzEVTNVn3U",
  authDomain: "signature-app-878a8.firebaseapp.com",
  projectId: "signature-app-878a8",
  storageBucket: "signature-app-878a8.appspot.com",
  messagingSenderId: "524854956900",
  appId: "1:524854956900:web:e926d9ea12f44af124a071",
  measurementId: "G-8SCTEYWL17",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { name, pfp, signature } = req.body;

    if (!name || !pfp || !signature) {
      return res.status(400).json({ message: "Missing fields" });
    }

    await addDoc(collection(db, "signatures"), {
      name,
      pfp,
      signature,
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ message: "Signature saved!" });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ message: "Server error" });
  }
}

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
        privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6AMLmWkOWr8xg
2D5S+HI1zDbP+Z9a2ECiudcmTDacLG96dXdoTwV4kH3M18hnaNkYSAnuEybP+VDz
JM6fRC0TvtUl7WuUFCBNepKTTEqacNxhmWaB2sE0jNYFnb5yoO5obwJ93unvZoMS
tpSp88El2X9gdE1ngXVp0n1idDBM5fw8RwPzFtE3fwjUQ8+iwJBg+w6q0kQTagyH
Xvhl5JEkcDdoT9IPB1Sr8OSfypJZVmItfuStuezvq1ZCR3mIVnwBQnAY5PEUkba5
AGeHHsTuLTmCvwntmfMbRlQP9vttQcJzsbOLSCsyMQTUDb2b55diqifm0N18ZpQX
vT+IzWPZAgMBAAECggEAAdecsCphs/4R89czp5+4hd1IoUuzVXOB3fq7bX1gwLA7
lG0FNz4p62h6KBhVCE0q2Hye+I6UM+6GUjouZh5tpREe5e0rKebL7eiFlIbmnQ8t
tGiQC6Y06d/UbAhrCMVpekhRln/DaMpNO9cdTTrR69C/j1JN9/Usym6gX+RcHBun
E5mBoDzric6vimAGDsc7YgQxdnOQdAIT8ir8efi/yE/bFgL09bGSIFJpJ49QO83o
x5IFEHhJIv6T7HYf+qROUQTHlHR+y4sKePnF/vkJL69BODxk3olVAPQ5B8GX3DwP
Ef2TgXLjMI2WjM7zykCmnQYLHims+vnpM3sK1M51GQKBgQD2H8sc9XW3rGVTJPR9
I3eAh7LZxDxPBkid1yimkTpou+Ux37o6XIYhujYHO/kKUOjsmnjWeZqizEOXpM5A
pQ/UFlLK3Zd2Nn3sJmwlpYUGCNCyYR2ebojQev8gZXieAVluwb76isrsygogp1ol
x+gYl0HG8u+yGQJ+AsdxexvBTQKBgQDBd2XssSN0rTS06VbNgeR3wIYOO5EQoVS4
sprzeCFSYxXZN3r7f39qmIsS4ZA4/V4frwaYDDq8mUiKgByQQkBmyzqAa9KbY8MX
q3J4F4p1nBtLL/skYBtLc4EQuyrJZSfmqmWcUdrlkt+VfqfDDTVNyByjmjycrTmA
N1WE6fdmvQKBgQC7myJ0sXmIhuU5Skr+dCFsHIOs0JLz3aNOhSncRYkTOl4K9TF7
uPkZDlqOix1ayq+xYlHHkivX+gFvvtTkm60ECfwT3HLOTd0QO31l+NP79I432iT8
ld69o3ODGzWkovyrmw1a5p6lfZ/YohfqAoYc8HbYEme5Bq1Kpg2mp6NRZQKBgFGF
HRaaIYWFgmMEu4XGyN1I63PN17d5M3jMEYyrvua3R7qKrTCSLb9d3aQsFZhd8q5J
Eu84n/teX3m0t9R1hiuKUPFR/aFqbQdpP8eoq7gY+ks5QYq3UGj/l4/UPhg0npaM
kFpJB4Ka28ljYA9JXn+S5bZuREIEn+kN5+QkrhHFAoGAIH1cQmkA8lCVoxf6/U3r
a3ZkjJmxm26dXuS/vTVT95Cl0FHBIltPb55lqsUCmVNfeQONZKo6KGY2M7HdmtJb
52g7sM2bRGUA6IuvtCWi7r7SUVCqwQBJSQBEhz2yBtyLbYzSeSwnLnQkCd1y+yfy
HcBYNhOlhbl+WjMnS2xFDiA=
-----END PRIVATE KEY-----`
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

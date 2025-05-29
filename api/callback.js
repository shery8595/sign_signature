// File: api/callback.js (Node.js / Express-style handler)

import fetch from 'node-fetch';

export default async function handler(req, res) {
  const { code, state } = req.query;
  const codeVerifier = req.cookies.code_verifier || req.headers['x-code-verifier'];

  if (!code || !codeVerifier) {
    return res.status(400).send("Missing code or code verifier");
  }

  const clientId = "UUY5SENHNllHejJZeU1vVlNlSjM6MTpjaQ";
  const redirectUri = "https://sign-signature.vercel.app/api/callback";

  // Exchange authorization code for access token
  const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier
    })
  });

  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    return res.status(500).json({ error: "Token exchange failed", detail: tokenData });
  }

  // Fetch user info
  const userResponse = await fetch("https://api.twitter.com/2/users/me?user.fields=profile_image_url", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  const userData = await userResponse.json();

  if (!userData.data) {
    return res.status(500).json({ error: "Failed to get user data", detail: userData });
  }

  const { name, profile_image_url } = userData.data;

  // Redirect with profile data as query string
  const params = new URLSearchParams({
    name,
    pfp: profile_image_url
  });

  res.redirect(`https://sign-signature.vercel.app/?${params.toString()}`);
}

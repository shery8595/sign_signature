import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // parse query params
    const { searchParams } = new URL(req.url, `https://${req.headers.host}`);
    const code = searchParams.get("code");
    const stateEncoded = searchParams.get("state");

    if (!code || !stateEncoded) {
      res.status(400).send("Missing code or state");
      return;
    }

    // Decode state to get code_verifier and csrf
    const stateStr = Buffer.from(stateEncoded, "base64").toString("utf-8");
    const state = JSON.parse(stateStr);
    const codeVerifier = state.codeVerifier;
    const csrfFromState = state.csrf;

    if (!codeVerifier) {
      res.status(400).send("Missing code verifier");
      return;
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: process.env.TWITTER_CLIENT_ID,
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://sign-signature.vercel.app/api/callback",
        code_verifier: codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      res.status(500).send("Token exchange failed: " + errorText);
      return;
    }

    const tokenJson = await tokenResponse.json();
    const accessToken = tokenJson.access_token;

    // Fetch user profile with access token
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      res.status(500).send("Failed to fetch user profile: " + errorText);
      return;
    }

    const userJson = await userResponse.json();

    const name = userJson.data.name;
    const pfp = userJson.data.profile_image_url || "";

    // Redirect back to your frontend with user info as URL params
    const frontendUrl = new URL("https://sign-signature.vercel.app");
    frontendUrl.searchParams.set("name", name);
    frontendUrl.searchParams.set("pfp", pfp);

    res.writeHead(302, {
      Location: frontendUrl.toString()
    });
    res.end();
  } catch (e) {
    res.status(500).send("Server error: " + e.message);
  }
}

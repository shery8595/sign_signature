export default async function handler(req, res) {
  const { code } = req.query;
  const clientId = process.env.TWITTER_CLIENT_ID; // Set in Vercel environment variables
  const clientSecret = process.env.TWITTER_CLIENT_SECRET; // Set in Vercel environment variables
  const redirectUri = 'https://your-project-name.vercel.app/api/callback';
  const codeVerifier = req.headers['x-code-verifier'] || localStorage.getItem('code_verifier');

  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier
      })
    });

    const data = await response.json();
    if (data.access_token) {
      res.status(200).json({ access_token: data.access_token });
    } else {
      res.status(400).json({ error: 'Failed to obtain access token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}
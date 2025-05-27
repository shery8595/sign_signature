export default async function handler(req, res) {
  const { code, code_verifier } = req.query;
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = 'https://sign-signature.vercel.app/api/callback';

  if (!code || !code_verifier) {
    return res.status(400).json({ error: 'Missing code or code_verifier' });
  }

  if (!clientId) {
    return res.status(500).json({ error: 'Missing TWITTER_CLIENT_ID environment variable' });
  }

  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier
      })
    });

    const data = await response.json();

    if (response.ok && data.access_token) {
      return res.status(200).json({ access_token: data.access_token });
    } else {
      return res.status(400).json({ error: 'Failed to obtain access token', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error', details: error.message });
  }
}

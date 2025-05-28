// /api/callback.js
export default async function handler(req, res) {
  const { code, code_verifier, state } = req.query;
  const clientId = process.env.TWITTER_CLIENT_ID;
  const redirectUri = process.env.REDIRECT_URI || 'https://sign-signature.vercel.app/api/callback';

  // Input validation
  if (!code || !code_verifier) {
    console.error('Missing required parameters:', { code, code_verifier });
    return res.status(400).json({ 
      error: 'Missing code or code_verifier',
      details: 'Both code and code_verifier query parameters are required' 
    });
  }

  if (!clientId) {
    console.error('Missing TWITTER_CLIENT_ID environment variable');
    return res.status(500).json({ 
      error: 'Server configuration error',
      details: 'TWITTER_CLIENT_ID environment variable is not set' 
    });
  }

  // Validate state (optional, implement if using state in frontend)
  const storedState = req.cookies?.oauth_state || localStorage.getItem('oauth_state');
  if (state && (!storedState || state !== storedState)) {
    console.error('Invalid state parameter:', { received: state, expected: storedState });
    return res.status(400).json({ 
      error: 'Invalid state parameter',
      details: 'State parameter does not match expected value' 
    });
  }

  try {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code_verifier,
      }),
    });

    const data = await response.json();
    console.log('Token endpoint response:', JSON.stringify(data, null, 2));

    if (response.ok && data.access_token) {
      return res.status(200).json({
        access_token: data.access_token,
        token_type: data.token_type || 'Bearer',
        expires_in: data.expires_in,
        refresh_token: data.refresh_token,
        scope: data.scope,
      });
    } else {
      console.error('Token endpoint error:', {
        status: response.status,
        statusText: response.statusText,
        data,
      });
      const errorDetails = data.error_description || data.error || 'Unknown error';
      const errorCode = data.code || response.status;
      return res.status(response.status === 401 ? 401 : 400).json({
        error: 'Failed to obtain access token',
        details: errorDetails,
        code: errorCode,
      });
    }
  } catch (error) {
    console.error('Server error during token request:', {
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ 
      error: 'Server error',
      details: error.message || 'Failed to process token request' 
    });
  }
}

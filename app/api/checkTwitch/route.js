//import fetch from 'node-fetch';
let cachedToken = null;
let tokenExpiry = null;

// eslint-disable-next-line no-unused-vars
export const GET = async (req) => {
  console.log('checkTwich');
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  //const username = req.query.username || 'your-twitch-username';
  const username = process.env.TWITCH_USERNAME;

  try {
    if (!cachedToken || Date.now() >= tokenExpiry) {
      const tokenResponse = await fetch('https://id.twitch.tv/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'client_credentials',
        }),
      });

      const tokenData = await tokenResponse.json();

      cachedToken = tokenData.access_token;
      console.log('setting cachedToken');
      console.log(cachedToken);
      tokenExpiry = Date.now() + tokenData.expires_in * 1000;
      //const oauthToken = tokenData.access_token;
    }

    // Fetch stream status
    const apiResponse = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`, {
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${cachedToken}`,
      },
    });

    const data = await apiResponse.json();

    const rData = {
      isLive: data.data && data.data.length > 0,
      streamData: data.data[0] || null,
    };

    return Response.json(rData);
  } catch (error) {
    console.error('Error fetching Twitch stream status:', error);
    res.status(500).json({ error: 'Failed to fetch Twitch stream status' });
  }
};

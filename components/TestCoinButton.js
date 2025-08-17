'use client';
import { useState } from 'react';

export default function TestCoinButton({ onTestCoin }) {
  const [isChecking, setIsChecking] = useState(false);
  const [availableRewards, setAvailableRewards] = useState([]);

  const handleTestClick = () => {
    console.log('Test coin button clicked');
    onTestCoin();
  };

  const checkRewards = async () => {
    setIsChecking(true);
    const accessToken = localStorage.getItem('twitchAccessToken');
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const broadcasterId = process.env.NEXT_PUBLIC_TWITCH_USERID;

    if (!accessToken || !clientId || !broadcasterId) {
      alert('Please log in to Twitch first!');
      setIsChecking(false);
      return;
    }

    // First, let's validate the token
    try {
      const validateResponse = await fetch('https://id.twitch.tv/oauth2/validate', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!validateResponse.ok) {
        alert('Your Twitch token is invalid. Please log out and log back in.');
        setIsChecking(false);
        return;
      }

      const tokenData = await validateResponse.json();
      console.log('Token scopes:', tokenData.scopes);

      // Check if we have the required scope
      if (!tokenData.scopes.includes('channel:read:redemptions')) {
        alert(
          `Your token is missing the channel:read:redemptions scope.\n\nCurrent scopes: ${tokenData.scopes.join(
            ', '
          )}\n\nPlease log out and log back in to get the correct permissions.`
        );
        setIsChecking(false);
        return;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      alert('Error validating token. Please try logging out and back in.');
      setIsChecking(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': clientId,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAvailableRewards(data.data || []);
        console.log('Available rewards:', data.data);
      } else {
        console.error('Failed to fetch rewards:', response.status);
        alert('Failed to fetch rewards. Check console for details.');
      }
    } catch (error) {
      console.error('Error checking rewards:', error);
      alert('Error checking rewards. Check console for details.');
    }

    setIsChecking(false);
  };

  // Only show in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (!isDevelopment) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1001 }}>
      <button
        onClick={handleTestClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#9146FF',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '14px',
          marginBottom: '10px',
          display: 'block',
        }}
      >
        Test Ancient Coin
      </button>
      <button
        onClick={checkRewards}
        disabled={isChecking}
        style={{
          padding: '10px 20px',
          backgroundColor: isChecking ? '#666' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: isChecking ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          display: 'block',
          marginBottom: '10px',
        }}
      >
        {isChecking ? 'Checking...' : 'Check Rewards'}
      </button>

      {availableRewards.length > 0 && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            borderRadius: '5px',
            fontSize: '12px',
            maxWidth: '300px',
          }}
        >
          <strong>Available Rewards:</strong>
          {availableRewards.map((reward, index) => (
            <div key={index} style={{ marginTop: '5px' }}>
              • {reward.title} (ID: {reward.id})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

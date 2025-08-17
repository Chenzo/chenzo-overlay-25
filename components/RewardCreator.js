'use client';
import { useEffect, useState } from 'react';

export default function RewardCreator() {
  const [isCreating, setIsCreating] = useState(false);
  const [rewardCreated, setRewardCreated] = useState(false);

  const createFakeCoinReward = async () => {
    setIsCreating(true);
    const accessToken = localStorage.getItem('twitchAccessToken');
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const broadcasterId = process.env.NEXT_PUBLIC_TWITCH_USERID;

    if (!accessToken || !clientId || !broadcasterId) {
      console.log('Missing credentials for creating reward');
      setIsCreating(false);
      return;
    }

    try {
      // First, check if the reward already exists
      const checkResponse = await fetch(
        `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': clientId,
          },
        }
      );

      if (checkResponse.ok) {
        const existingRewards = await checkResponse.json();
        const fakeCoinExists = existingRewards.data?.some((reward) => reward.title.toLowerCase().includes('fake coin'));

        if (fakeCoinExists) {
          console.log('✅ Fake Coin reward already exists');
          setRewardCreated(true);
          setIsCreating(false);
          return;
        }
      }

      // Create the Fake Coin reward
      const createResponse = await fetch(
        `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Client-Id': clientId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: 'Drop aFake Coin',
            cost: 10,
            prompt: 'Drop a fake coin and make twitch you are engaging with the crew!',
            is_enabled: true,
            is_user_input_required: false,
            background_color: '#FFD54F',
            should_redemptions_skip_request_queue: true,
            default_image: {
              url_1x: 'http://localhost:3001/images/redemption_icons/ac_28.png',
              url_2x: 'http://localhost:3001/images/redemption_icons/ac_56.png',
              url_4x: 'http://localhost:3001/images/redemption_icons/ac_112.png',
            },
          }),
        }
      );

      if (createResponse.ok) {
        const createdReward = await createResponse.json();
        console.log('✅ Fake Coin reward created successfully:', createdReward.data[0]);
        setRewardCreated(true);
      } else {
        const errorData = await createResponse.json();
        console.error('❌ Failed to create Fake Coin reward:', errorData);
      }
    } catch (error) {
      console.error('❌ Error creating Fake Coin reward:', error);
    }

    setIsCreating(false);
  };

  useEffect(() => {
    // Create the reward when the component mounts
    createFakeCoinReward();
  }, []);

  return null; // This component doesn't render anything
}

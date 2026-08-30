'use client';
import { useEffect } from 'react';
import { allManagedRewardTitles } from '../config/rewards';

export default function RewardCreator({ rewards }) {
  const syncRewards = async () => {
    const accessToken = localStorage.getItem('twitchAccessToken');
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const broadcasterId = process.env.NEXT_PUBLIC_TWITCH_USERID;

    if (!accessToken || !clientId || !broadcasterId) {
      console.log('Missing credentials for creating rewards');
      return;
    }

    try {
      // First, check if the custom rewards already exist
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

        // Remove rewards left over from a theme that isn't active anymore
        for (const existingReward of existingRewards.data || []) {
          const title = existingReward.title.toLowerCase();
          const isManagedByUs = allManagedRewardTitles.includes(title);
          const belongsToActiveTheme = rewards.some((rewardConfig) => rewardConfig.title.toLowerCase() === title);

          if (isManagedByUs && !belongsToActiveTheme) {
            console.log(`🗑️ Removing reward from inactive theme: ${existingReward.title}`);
            await fetch(
              `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${broadcasterId}&id=${existingReward.id}`,
              {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Client-Id': clientId,
                },
              }
            );
          }
        }

        // Check each configured reward for the active theme
        for (const rewardConfig of rewards) {
          const rewardExists = existingRewards.data?.some(
            (reward) => reward.title.toLowerCase() === rewardConfig.title.toLowerCase()
          );

          if (rewardExists) {
            console.log(`✅ ${rewardConfig.title} reward already exists`);
            continue;
          }

          // Create the reward
          console.log(`🔄 Creating ${rewardConfig.title} reward...`);
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
                title: rewardConfig.title,
                cost: rewardConfig.cost,
                prompt: rewardConfig.prompt,
                is_enabled: rewardConfig.is_enabled,
                is_user_input_required: rewardConfig.is_user_input_required,
                background_color: rewardConfig.background_color,
                should_redemptions_skip_request_queue: rewardConfig.should_redemptions_skip_request_queue,
                default_image: rewardConfig.default_image,
              }),
            }
          );

          if (createResponse.ok) {
            const createdReward = await createResponse.json();
            console.log(`✅ ${rewardConfig.title} reward created successfully:`, createdReward.data[0]);
          } else {
            const errorData = await createResponse.json();
            console.error(`❌ Failed to create ${rewardConfig.title} reward:`, errorData);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error syncing rewards:', error);
    }
  };

  useEffect(() => {
    // Runs on mount and again whenever the active theme's reward list changes
    if (rewards.length === 0) return;
    syncRewards();
  }, [rewards]);

  return null; // This component doesn't render anything
}

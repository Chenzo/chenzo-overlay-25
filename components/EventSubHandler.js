'use client';
import { useEffect, useState } from 'react';
import { rewards } from '../config/rewards';

export default function EventSubHandler({ onCoinRewardRedeemed }) {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('twitchAccessToken');
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const broadcasterId = process.env.NEXT_PUBLIC_TWITCH_USERID;

    if (!accessToken || !clientId || !broadcasterId) {
      console.log('Missing credentials for EventSub');
      return;
    }

    // Prevent multiple initializations
    if (isInitialized) {
      console.log('EventSub already initialized, skipping...');
      return;
    }

    setIsInitialized(true);
    let ws = null;
    let reconnectTimer = null;

    const connectWebSocket = () => {
      // Connect to EventSub WebSocket
      ws = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

      ws.onopen = () => {
        console.log('🔌 Connected to Twitch EventSub WebSocket');
        setIsConnected(true);
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 EventSub message received:', data);

        // Handle welcome message
        if (data.metadata?.message_type === 'session_welcome') {
          const sessionId = data.payload?.session?.id;
          setSessionId(sessionId);
          console.log('🎫 Session ID received:', sessionId);

          // Subscribe to channel point redemptions
          await subscribeToChannelPointRedemptions(ws, sessionId, broadcasterId, accessToken, clientId);
        }

        // Handle notification messages
        if (data.metadata?.message_type === 'notification') {
          const payload = data.payload;
          
          if (payload.subscription?.type === 'channel.channel_points_custom_reward_redemption.add') {
            const redemption = payload.event;
            console.log('🎁 Channel point redemption detected:', redemption);
            
            // Check if this is any of our configured rewards
            const matchedReward = rewards.find(reward => 
              redemption.reward.title.toLowerCase().includes(reward.title.toLowerCase())
            );

            if (matchedReward) {
              console.log(`🪙 ${matchedReward.title.toUpperCase()} REDEMPTION DETECTED!`);
              console.log('👤 Redeemed by:', redemption.user_name);
              console.log('💰 Cost:', redemption.reward.cost);
              console.log('🎬 Animation type:', matchedReward.animation.type);
              onCoinRewardRedeemed();
            }
          }
        }

        // Handle subscription status
        if (data.metadata?.message_type === 'subscription_create') {
          console.log('✅ Subscription created successfully');
        }

        // Handle subscription failures
        if (data.metadata?.message_type === 'subscription_create_failed') {
          console.error('❌ Subscription creation failed:', data.payload);
        }

        // Handle session revocations
        if (data.metadata?.message_type === 'session_revoke') {
          console.error('🚫 Session revoked:', data.payload);
        }

        // Handle session keepalive
        if (data.metadata?.message_type === 'session_keepalive') {
          console.log('💓 Keepalive received');
        }
      };

      ws.onerror = (error) => {
        console.error('❌ EventSub WebSocket error:', error);
        console.log('This error is usually harmless - the connection will retry automatically');
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('🔌 EventSub WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        reconnectTimer = setTimeout(() => {
          console.log('🔄 Attempting to reconnect to EventSub...');
          connectWebSocket();
        }, 5000);
      };
    };

    const subscribeToChannelPointRedemptions = async (ws, sessionId, broadcasterId, accessToken, clientId) => {
      try {
        // First, get existing subscriptions
        const listResponse = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': clientId,
          },
        });

        if (listResponse.ok) {
          const subscriptions = await listResponse.json();
          console.log('📋 Current subscriptions:', subscriptions.data?.length || 0);

          // Delete existing channel point redemption subscriptions
          for (const sub of subscriptions.data || []) {
            if (sub.type === 'channel.channel_points_custom_reward_redemption.add') {
              console.log('🗑️ Deleting existing subscription:', sub.id);
              await fetch(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${sub.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Client-Id': clientId,
                },
              });
            }
          }
        }

        // Wait a moment for deletions to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create the new subscription
        const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Client-Id': clientId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'channel.channel_points_custom_reward_redemption.add',
            version: '1',
            condition: {
              broadcaster_user_id: broadcasterId,
            },
            transport: {
              method: 'websocket',
              session_id: sessionId,
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ EventSub subscription created for Fake Coin detection:', data);
        } else {
          const errorData = await response.json();
          console.error('❌ Failed to create EventSub subscription:', errorData);
        }
      } catch (error) {
        console.error('❌ Error creating EventSub subscription:', error);
      }
    };

    // Start the connection with a small delay to ensure page is ready
    setTimeout(() => {
      connectWebSocket();
    }, 1000);

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up EventSub connection...');
      if (ws) {
        ws.close();
      }
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      setIsInitialized(false);
    };
      }, []); // Empty dependency array to prevent re-initialization

  return null; // This component doesn't render anything
}

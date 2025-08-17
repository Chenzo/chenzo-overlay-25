# Channel Point Reward Setup Guide

## Overview
This overlay now includes a custom channel point reward system that displays an ancient coin when someone redeems a specific channel point reward.

## Setup Instructions

### 1. Create the Channel Point Reward
1. Go to your Twitch Creator Dashboard
2. Navigate to "Channel Points" → "Custom Rewards"
3. Click "Create Custom Reward"
4. Set the following:
   - **Title**: "Ancient Coin" (or any title containing "coin")
   - **Cost**: Set your desired channel point cost
   - **Description**: "Display an ancient coin on stream!"
   - **Category**: Choose "Just for Fun" or "Channel Customization"
   - **Require Viewer Input**: Optional (set to "No" for simplicity)
   - **Global Cooldown**: Set if desired
   - **Per-User Cooldown**: Set if desired

### 2. Environment Variables
Make sure you have these environment variables set in your `.env.local` file:

```env
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_USERNAME=your_twitch_username
TWITCH_USERID=your_twitch_user_id
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
NEXT_PUBLIC_TWITCH_REDIRECT_URI=http://localhost:3001/auth/twitch
```

### 3. Authentication
1. Click "LOG INTO TWITCH" in the overlay menu
2. Authorize the application with the required permissions
3. The system will automatically detect your channel point rewards

### 4. Testing
- Use the "Test Ancient Coin" button (purple button in bottom-right corner) to test the coin display
- The coin will appear for 3 seconds with a glowing animation
- Check the browser console for debugging information

## How It Works

### Components
- **AncientCoin**: Displays the coin image with animations
- **ChannelPointHandler**: Polls for channel point redemptions
- **ChatRelay**: Also listens for redemption events via TMI.js
- **API Route**: `/api/channelPoints` handles redemption polling and fulfillment

### Flow
1. User redeems the "Ancient Coin" channel point reward
2. The system polls for recent redemptions every 3 seconds
3. When a redemption is detected, the coin appears for 3 seconds
4. The redemption is automatically marked as "fulfilled"

### Features
- **Automatic Detection**: Finds any reward with "coin" in the title
- **Real-time Polling**: Checks for redemptions every 3 seconds
- **Automatic Fulfillment**: Marks redemptions as fulfilled after display
- **Beautiful Animation**: Coin appears with a scale and glow effect
- **Test Mode**: Manual test button for development

## Troubleshooting

### Coin Not Appearing
1. Check browser console for errors
2. Verify the reward title contains "coin"
3. Ensure you're logged into Twitch
4. Check that the API endpoint `/api/channelPoints` is working

### API Errors
1. Verify all environment variables are set
2. Check that your Twitch app has the correct permissions
3. Ensure your Twitch user ID is correct

### Permission Issues
1. Re-authenticate with Twitch
2. Make sure the scope includes `channel:read:redemptions`
3. Check that your Twitch app is configured correctly

## Customization

### Changing the Coin Image
Replace `/public/images/ancient_coin.webp` with your desired image

### Modifying Animation Duration
Edit the timeout in `components/AncientCoin.js` (currently 3000ms)

### Changing Polling Frequency
Edit the interval in `components/ChannelPointHandler.js` (currently 3000ms)

### Styling the Coin
Modify `components/AncientCoin.module.scss` for custom animations and styling

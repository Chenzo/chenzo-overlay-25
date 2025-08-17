# Twitch Overlay Setup Guide

## 🎯 **Overview**

This Twitch overlay includes a complete channel point reward system that automatically creates a "Fake Coin" reward and displays an animated ancient coin when someone redeems it. The system uses EventSub WebSocket for real-time detection.

## 🚀 **Quick Start**

### **1. Environment Setup**

Create a `.env.local` file with these variables:
```env
TWITCH_CLIENT_ID=your_twitch_client_id
TWITCH_CLIENT_SECRET=your_twitch_client_secret
TWITCH_USERNAME=your_twitch_username
TWITCH_USERID=your_twitch_user_id
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_twitch_client_id
NEXT_PUBLIC_TWITCH_REDIRECT_URI=http://localhost:3001/auth/twitch
NEXT_PUBLIC_TWITCH_USERID=your_twitch_user_id
```

### **2. Twitch App Configuration**

Go to [Twitch Developer Console](https://dev.twitch.tv/console) and:

#### **App Settings:**
- **Client ID**: Copy to your environment variables
- **Client Secret**: Copy to your environment variables  
- **OAuth Redirect URLs**: Add `http://localhost:3001/auth/twitch`
- **Category**: Set to "Application Integration"

### **3. Authentication**
1. **Start the overlay** - Run `npm run dev`
2. **Click "LOG INTO TWITCH"** in the overlay menu
3. **Authorize the application** - Grant required permissions
4. **Verify connection** - Check console for success messages

## 🪙 **How the System Works**

### **Automatic Setup (When Overlay Loads):**
1. **RewardCreator** → Creates "Fake Coin" reward with custom icons
2. **EventSubHandler** → Connects to Twitch EventSub WebSocket
3. **Subscription Management** → Cleans up old subscriptions, creates new one
4. **Real-time Detection** → Listens for "Fake Coin" redemptions

### **When Someone Redeems Fake Coin:**
1. **EventSub detects redemption** → Real-time WebSocket notification
2. **Console logs details** → Shows who redeemed it
3. **Triggers animation** → Ancient coin drops from header at random position
4. **Coin displays for 3 seconds** → Beautiful glow and scale animation

### **Components:**
- **RewardCreator** - Automatically creates "Fake Coin" reward
- **EventSubHandler** - Real-time redemption detection via WebSocket
- **AncientCoin** - Beautiful coin animation with random positioning
- **TestCoinButton** - Manual testing and reward checking

## 🧪 **Testing**

### **Manual Testing:**
- **"Test Ancient Coin" button** - Purple button in bottom-right corner
- **"Check Rewards" button** - Green button to see available rewards
- **Console logs** - Detailed debugging information

### **Real Testing:**
1. **Go to your Twitch channel**
2. **Redeem the "Fake Coin" reward** (costs 1 channel point)
3. **Watch the overlay** - Ancient coin should appear
4. **Check console** - Should see detection logs

## 🔧 **Troubleshooting**

### **Authentication Issues:**
- **"Missing credentials"** → Click "LOG INTO TWITCH" and authorize
- **"Invalid token"** → Log out and log back in
- **"Missing scopes"** → Re-authenticate to get `channel:read:redemptions`

### **EventSub Issues:**
- **"429 Too Many Requests"** → System automatically cleans up old subscriptions
- **"Connection failed"** → Check internet connection and try refreshing
- **"Subscription failed"** → Check console for specific error details

### **Reward Issues:**
- **"Fake Coin not created"** → Check console for creation errors
- **"Reward not detected"** → Verify reward exists in Twitch dashboard
- **"Animation not working"** → Use test button to verify coin display

### **Common Console Logs:**
```
✅ Fake Coin reward created successfully
🔌 Connected to Twitch EventSub WebSocket
🎫 Session ID received
✅ EventSub subscription created for Fake Coin detection
🪙 FAKE COIN REDEMPTION DETECTED!
👤 Redeemed by: [username]
```

## 🎨 **Customization**

### **Coin Animation:**
- **Duration**: Edit timeout in `components/AncientCoin.js` (currently 3000ms)
- **Position**: Random between 20%-80% of screen width
- **Size**: 80px tall, drops from behind header
- **Styling**: Modify `components/AncientCoin.module.scss`

### **Reward Settings:**
- **Cost**: 1 channel point (set in RewardCreator)
- **Title**: "Fake Coin" (customizable in RewardCreator)
- **Icons**: Uses `ac_28.png`, `ac_56.png`, `ac_112.png` from `/public/images/redemption_icons/`
- **Background**: Yellow (#FFD54F)

### **EventSub Settings:**
- **Auto-reconnect**: 5-second delay on disconnection
- **Subscription cleanup**: Automatically removes old subscriptions
- **Error handling**: Comprehensive logging and error recovery

## 🚨 **Advanced Debugging**

### **Manual Token Check:**
Visit `https://id.twitch.tv/oauth2/validate` with header:
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### **EventSub Status:**
Check your EventSub subscriptions at:
```
https://api.twitch.tv/helix/eventsub/subscriptions
```

### **Reward Management:**
View your channel point rewards at:
```
https://api.twitch.tv/helix/channel_points/custom_rewards
```

## 📋 **Environment Variables Reference**

| Variable | Description | Required |
|----------|-------------|----------|
| `TWITCH_CLIENT_ID` | Your Twitch app client ID | ✅ |
| `TWITCH_CLIENT_SECRET` | Your Twitch app client secret | ✅ |
| `TWITCH_USERNAME` | Your Twitch username | ✅ |
| `TWITCH_USERID` | Your Twitch user ID | ✅ |
| `NEXT_PUBLIC_TWITCH_CLIENT_ID` | Public client ID for frontend | ✅ |
| `NEXT_PUBLIC_TWITCH_REDIRECT_URI` | OAuth redirect URL | ✅ |
| `NEXT_PUBLIC_TWITCH_USERID` | Public user ID for frontend | ✅ |

## 🎯 **Success Indicators**

When everything is working correctly, you should see:
- ✅ **Fake Coin reward created** in console
- ✅ **EventSub connected** with session ID
- ✅ **Subscription created** successfully
- ✅ **Test button works** - coin animation displays
- ✅ **Real redemptions detected** - console logs when someone redeems

The system is now fully automated and will handle reward creation, real-time detection, and beautiful animations automatically!

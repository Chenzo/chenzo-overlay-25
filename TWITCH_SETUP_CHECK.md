# Twitch Setup Verification Guide

## 🔍 **Step-by-Step Verification**

### **1. Check Your Twitch App Configuration**

Go to [Twitch Developer Console](https://dev.twitch.tv/console) and verify:

#### **App Settings:**
- **Client ID**: Should match your `NEXT_PUBLIC_TWITCH_CLIENT_ID`
- **Client Secret**: Should match your `TWITCH_CLIENT_SECRET`
- **OAuth Redirect URLs**: Must include `http://localhost:3001/auth/twitch`

#### **Category:**
- Set to **"Application Integration"** or **"Mobile Integration"**

### **2. Verify Environment Variables**

Make sure your `.env.local` file has:
```env
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
TWITCH_USERNAME=your_twitch_username
TWITCH_USERID=your_twitch_user_id
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_TWITCH_REDIRECT_URI=http://localhost:3001/auth/twitch
NEXT_PUBLIC_TWITCH_USERID=your_twitch_user_id
```

### **3. Complete Re-authentication Process**

1. **Click "LOG OUT OF TWITCH"** in your overlay menu
2. **Wait for the page to reload**
3. **Click "LOG INTO TWITCH"**
4. **Authorize the application** - make sure you see the scopes being requested
5. **Check the browser console** for any errors during authentication

### **4. Test Token Permissions**

1. **Click the green "Check Rewards" button**
2. **Look at the alert message** - it should show your current token scopes
3. **Verify you see**: `channel:read:redemptions` in the scopes list

### **5. Common Issues & Solutions**

#### **Issue: "Missing channel:read:redemptions scope"**
**Solution:**
- Make sure you're logged in as the **channel owner** (not a moderator)
- Verify your Twitch app has the correct redirect URI
- Try logging out completely and logging back in

#### **Issue: "403 Forbidden"**
**Solution:**
- Check that your `TWITCH_USERID` matches your actual Twitch user ID
- Verify you're using the correct client ID
- Ensure your app is properly configured in the Twitch Developer Console

#### **Issue: "Invalid redirect URI"**
**Solution:**
- Add `http://localhost:3001/auth/twitch` to your app's OAuth Redirect URLs
- Make sure there are no extra spaces or characters

### **6. Manual Token Verification**

You can manually check your token by visiting:
```
https://id.twitch.tv/oauth2/validate
```

Add the header: `Authorization: Bearer YOUR_TOKEN_HERE`

This should return your token information including scopes.

### **7. Debug Information**

When you click "Check Rewards", the system will:
1. Validate your token
2. Show current scopes
3. Try to fetch your channel point rewards
4. Display any available rewards

If you see an error, the alert will tell you exactly what's missing.

## 🚨 **If Still Not Working**

1. **Clear browser cache and cookies**
2. **Try in an incognito/private window**
3. **Verify your Twitch app is in the correct category**
4. **Check that you're logged in as the channel owner**
5. **Ensure your redirect URI exactly matches what's in your Twitch app settings**

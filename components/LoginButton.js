'use client';

//import styles from './Header.module.scss';

export default function LoginButton() {
  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI;
    const scope =
      'moderator:read:followers channel:read:subscriptions channel:read:redemptions channel:manage:redemptions';

    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(scope)}`;

    window.location.href = twitchAuthUrl;
  };

  return <button onClick={handleLogin}>LOG INTO TWITCH</button>;
}

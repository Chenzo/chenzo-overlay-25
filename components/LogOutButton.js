'use client';

export default function LogOutButton({ setLoggedIn }) {
  const handleLogout = () => {
    // Clear all Twitch-related data
    localStorage.removeItem('twitchAccessToken');
    localStorage.removeItem('twitch_user_id');
    localStorage.removeItem('twitch_username');
    
    // Clear any other potential Twitch data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('twitch') || key.includes('Twitch')) {
        localStorage.removeItem(key);
      }
    });
    
    setLoggedIn(false);
    
    // Force a complete page reload to clear any cached state
    window.location.href = '/';
  };

  return <button onClick={handleLogout}>LOG OUT OF TWITCH</button>;
}

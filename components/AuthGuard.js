'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LogOutButton from './LogOutButton';
import { getUserAccessLevel, hasSounderAccess } from '../config/authorizedUsers';

export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userAccessLevel, setUserAccessLevel] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('twitchAccessToken');
      
      if (accessToken) {
        setIsAuthenticated(true);
        
        // Fetch user data from Twitch API
        try {
          const response = await fetch('https://api.twitch.tv/helix/users', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Client-Id': process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID,
            },
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
              const user = data.data[0];
              const userInfo = {
                id: user.id,
                username: user.login,
                displayName: user.display_name,
                avatarUrl: user.profile_image_url,
              };
              setUserData(userInfo);
              
              // Check user access level
              const accessLevel = getUserAccessLevel(user.login);
              setUserAccessLevel(accessLevel);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setIsAuthenticated(false);
        setUserData(null);
        setUserAccessLevel(null);
      }
      
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (in case user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key === 'twitchAccessToken') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('twitchAccessToken');
    localStorage.removeItem('twitch_user_id');
    localStorage.removeItem('twitch_username');
    
    // Clear any other potential Twitch data
    Object.keys(localStorage).forEach(key => {
      if (key.includes('twitch') || key.includes('Twitch')) {
        localStorage.removeItem(key);
      }
    });
    
    setIsAuthenticated(false);
    setUserData(null);
    setUserAccessLevel(null);
    // Redirect to the current page to trigger the login flow again
    router.push(window.location.pathname);
  };

  const handleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI;
    const scope =
      'moderator:read:followers channel:read:subscriptions channel:read:redemptions channel:manage:redemptions';

    // Add the current path as a redirect parameter
    const currentPath = window.location.pathname;
    const twitchAuthUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=token&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(currentPath)}`;

    window.location.href = twitchAuthUrl;
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#444',
        color: '#fff',
        fontSize: '18px'
      }}>
        Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#444',
        color: '#fff',
        gap: '20px'
      }}>
        <h1>Access Restricted</h1>
        <p>You need to be logged into Twitch to access this page.</p>
        <button onClick={handleLogin}>LOG INTO TWITCH</button>
      </div>
    );
  }

  // Check if user has access to sounder page (level 0 or 1)
  if (window.location.pathname === '/sounder' && userAccessLevel !== null && userAccessLevel > 1) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: '#444',
        color: '#fff',
        gap: '20px'
      }}>
        <h1>Access Denied</h1>
        <p>Contact chenzo for access</p>
        <LogOutButton setLoggedIn={setIsAuthenticated} redirectTo={window.location.pathname} />
      </div>
    );
  }

  return (
    <div>
      <div style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 1000,
        background: '#333',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #555',
        minWidth: '200px'
      }}>
        {userData ? (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '10px' }}>
            <img 
              src={userData.avatarUrl} 
              alt={userData.displayName}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid #555'
              }}
            />
            <div>
              <div style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>
                {userData.displayName}
              </div>
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                @{userData.username}
              </div>
              <div style={{ fontSize: '10px', color: '#888' }}>
                Level {userAccessLevel}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '15px', fontSize: '14px', color: '#ccc' }}>
            Loading user data...
          </div>
        )}
        <LogOutButton setLoggedIn={setIsAuthenticated} redirectTo={window.location.pathname} />
      </div>
      {children}
    </div>
  );
}

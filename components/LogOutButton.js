'use client';

export default function LogOutButton({ setLoggedIn }) {
  const handleLogout = () => {
    localStorage.removeItem('twitchAccessToken');
    setLoggedIn(false);
    window.location.href = '/';
  };

  return <button onClick={handleLogout}>Log Out</button>;
}

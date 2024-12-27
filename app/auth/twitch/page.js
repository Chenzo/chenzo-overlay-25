'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TwitchAuth() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash;

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');

      if (accessToken) {
        localStorage.setItem('twitchAccessToken', accessToken);
        router.push('/'); // Redirect to home or desired page
      }
    }
  }, [router]);

  return <p>Authenticating...</p>;
}

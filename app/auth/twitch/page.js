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
      const state = params.get('state');

      if (accessToken) {
        localStorage.setItem('twitchAccessToken', accessToken);

        // Use the state parameter as redirect destination, otherwise default to /sounder
        const redirectTo = state || '/sounder';
        router.push(redirectTo);
      }
    }
  }, [router]);

  return <p>Authenticating...</p>;
}

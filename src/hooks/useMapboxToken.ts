import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        // For now, we'll use a temporary input approach since the token 
        // is stored in Edge Function secrets, not accessible from client
        // In production, you'd call an edge function to get this
        const storedToken = localStorage.getItem('mapbox_token');
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (err) {
        setError('Failed to load Mapbox token');
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  const saveToken = (newToken: string) => {
    localStorage.setItem('mapbox_token', newToken);
    setToken(newToken);
  };

  return { token, loading, error, saveToken };
}

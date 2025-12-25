import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  const [token, setToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      console.log('[useMapboxToken] Fetching token from edge function...');
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');

        console.log('[useMapboxToken] Response:', { data, error });

        if (error) {
          console.error('[useMapboxToken] Edge function error:', error);
          setError(`Failed to load Mapbox token: ${error.message || 'Unknown error'}`);
          return;
        }

        if (data?.token) {
          console.log('[useMapboxToken] Token received (length:', data.token.length, ')');
          setToken(data.token);
        } else {
          console.warn('[useMapboxToken] No token in response data:', data);
          setError('Mapbox token not configured in backend secrets');
        }
      } catch (err: any) {
        console.error('[useMapboxToken] Unexpected error:', err);
        setError(`Failed to load Mapbox token: ${err?.message || 'Unexpected error'}`);
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return { token, loading, error };
}

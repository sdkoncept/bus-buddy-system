import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GPSPosition {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number;
  timestamp: number;
}

interface UseGPSTrackingOptions {
  tripId?: string;
  busId?: string;
  updateIntervalMs?: number;
  enabled?: boolean;
}

export function useGPSTracking({
  tripId,
  busId,
  updateIntervalMs = 15000, // 15 seconds default
  enabled = false,
}: UseGPSTrackingOptions) {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentRef = useRef<number>(0);

  const sendLocation = useCallback(async (pos: GPSPosition) => {
    if (!busId) {
      console.log('No bus ID provided, skipping location update');
      return;
    }

    // Throttle updates
    const now = Date.now();
    if (now - lastSentRef.current < updateIntervalMs) {
      return;
    }
    lastSentRef.current = now;

    try {
      const { error: sendError } = await supabase.functions.invoke('update-bus-location', {
        body: {
          busId,
          tripId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: pos.speed,
          heading: pos.heading,
        },
      });

      if (sendError) {
        console.error('Error sending location:', sendError);
      } else {
        console.log('Location sent successfully:', pos);
      }
    } catch (err) {
      console.error('Failed to send location:', err);
    }
  }, [busId, tripId, updateIntervalMs]);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      toast.error('Geolocation not supported');
      return;
    }

    if (!busId) {
      setError('No bus assigned');
      return;
    }

    setError(null);
    setIsTracking(true);

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (geoPosition) => {
        const newPosition: GPSPosition = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
          speed: geoPosition.coords.speed,
          heading: geoPosition.coords.heading,
          accuracy: geoPosition.coords.accuracy,
          timestamp: geoPosition.timestamp,
        };

        setPosition(newPosition);
        sendLocation(newPosition);
      },
      (geoError) => {
        console.error('Geolocation error:', geoError);
        setError(geoError.message);
        
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            toast.error('Location permission denied. Please enable location access.');
            break;
          case geoError.POSITION_UNAVAILABLE:
            toast.error('Location unavailable. Please check your GPS.');
            break;
          case geoError.TIMEOUT:
            toast.error('Location request timed out.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    toast.success('GPS tracking started');
  }, [busId, sendLocation]);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsTracking(false);
    toast.info('GPS tracking stopped');
  }, []);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && busId && !isTracking) {
      startTracking();
    } else if (!enabled && isTracking) {
      stopTracking();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, busId, isTracking, startTracking, stopTracking]);

  return {
    position,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}

// Hook for subscribing to realtime bus locations
export function useRealtimeBusLocations() {
  const [locations, setLocations] = useState<Map<string, any>>(new Map());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial fetch
    const fetchLocations = async () => {
      const { data, error } = await supabase
        .from('bus_locations')
        .select(`
          *,
          bus:buses(id, registration_number, model)
        `)
        .order('recorded_at', { ascending: false });

      if (!error && data) {
        const locationMap = new Map();
        data.forEach(loc => {
          // Keep only the most recent location per bus
          if (!locationMap.has(loc.bus_id)) {
            locationMap.set(loc.bus_id, loc);
          }
        });
        setLocations(locationMap);
        console.log('Fetched initial bus locations:', locationMap.size);
      }
    };

    fetchLocations();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('bus-locations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bus_locations',
        },
        (payload) => {
          console.log('Realtime bus location update:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setLocations(prev => {
              const newMap = new Map(prev);
              newMap.set(payload.new.bus_id, payload.new);
              return newMap;
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { locations: Array.from(locations.values()), isConnected };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { Geolocation, Position, PermissionStatus } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { bearingDegrees, speedKmhFromSamples } from '@/lib/geo';

interface GPSPosition {
  latitude: number;
  longitude: number;
  speed: number | null; // m/s from device API
  heading: number | null; // degrees from device API
  accuracy: number;
  timestamp: number;
}

interface UseCapacitorGPSOptions {
  tripId?: string;
  busId?: string;
  updateIntervalMs?: number;
  enabled?: boolean;
}

export function useCapacitorGPS({
  tripId,
  busId,
  updateIntervalMs = 15000,
  enabled = false,
}: UseCapacitorGPSOptions) {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const watchIdRef = useRef<string | null>(null);
  const lastSentRef = useRef<number>(0);
  const lastFixRef = useRef<GPSPosition | null>(null);
  const isNative = Capacitor.isNativePlatform();

  // Check if running on native platform
  const checkPlatform = useCallback(() => {
    console.log('[CapacitorGPS] Platform:', Capacitor.getPlatform());
    console.log('[CapacitorGPS] Is native:', isNative);
    return isNative;
  }, [isNative]);

  // Check and request permissions
  const checkPermissions = useCallback(async () => {
    try {
      const status = await Geolocation.checkPermissions();
      console.log('[CapacitorGPS] Permission status:', status);
      setPermissionStatus(status);
      return status;
    } catch (err) {
      console.error('[CapacitorGPS] Error checking permissions:', err);
      return null;
    }
  }, []);

  const requestPermissions = useCallback(async () => {
    try {
      const status = await Geolocation.requestPermissions();
      console.log('[CapacitorGPS] Permission requested:', status);
      setPermissionStatus(status);
      return status;
    } catch (err) {
      console.error('[CapacitorGPS] Error requesting permissions:', err);
      setError('Failed to request location permissions');
      return null;
    }
  }, []);

  // Send location to backend
  const sendLocation = useCallback(
    async (pos: GPSPosition) => {
      if (!busId) {
        console.log('[CapacitorGPS] No bus ID, skipping update');
        return;
      }

      const now = Date.now();
      if (now - lastSentRef.current < updateIntervalMs) {
        return;
      }
      lastSentRef.current = now;

      // Normalize speed to km/h (device speed is usually m/s). If missing, compute from last fix.
      const prev = lastFixRef.current;
      const computedSpeedKmh =
        pos.speed == null && prev
          ? speedKmhFromSamples(
              {
                latitude: prev.latitude,
                longitude: prev.longitude,
                timestamp: prev.timestamp,
              },
              { latitude: pos.latitude, longitude: pos.longitude, timestamp: pos.timestamp }
            )
          : null;

      const speedKmh =
        pos.speed == null
          ? computedSpeedKmh
          : Math.max(0, pos.speed * 3.6);

      // Normalize heading (if missing, compute bearing from last fix)
      const heading =
        pos.heading == null && prev
          ? bearingDegrees(
              {
                latitude: prev.latitude,
                longitude: prev.longitude,
                timestamp: prev.timestamp,
              },
              { latitude: pos.latitude, longitude: pos.longitude, timestamp: pos.timestamp }
            )
          : pos.heading;

      try {
        console.log('[CapacitorGPS] Sending location:', {
          busId,
          tripId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          speedKmh,
          heading,
          accuracy: pos.accuracy,
          timestamp: pos.timestamp,
        });

        const { error: sendError } = await supabase.functions.invoke('update-bus-location', {
          body: {
            busId,
            tripId,
            latitude: pos.latitude,
            longitude: pos.longitude,
            speed: speedKmh == null ? null : Number(speedKmh.toFixed(2)),
            heading: heading == null ? null : Math.round(heading),
          },
        });

        if (sendError) {
          console.error('[CapacitorGPS] Error sending location:', sendError);
        } else {
          console.log('[CapacitorGPS] Location sent successfully');
        }
      } catch (err) {
        console.error('[CapacitorGPS] Failed to send location:', err);
      }
    },
    [busId, tripId, updateIntervalMs]
  );

  // Handle position update
  const handlePositionUpdate = useCallback(
    (position: Position) => {
      const newPosition: GPSPosition = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      console.log('[CapacitorGPS] Position update:', newPosition);
      setPosition(newPosition);
      sendLocation(newPosition);
      lastFixRef.current = newPosition;
    },
    [sendLocation]
  );

  // Start tracking
  const startTracking = useCallback(async () => {
    console.log('[CapacitorGPS] startTracking called', { busId, tripId, isTracking });

    if (!busId) {
      console.log('[CapacitorGPS] No bus ID, cannot start tracking');
      setError('No bus assigned');
      return;
    }

    setError(null);

    try {
      // Check/request permissions first
      let status = await checkPermissions();
      if (status?.location !== 'granted') {
        status = await requestPermissions();
        if (status?.location !== 'granted') {
          setError('Location permission denied');
          toast.error('Location permission denied. Please enable in settings.');
          return;
        }
      }

      // Start watching position
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        },
        (position, err) => {
          if (err) {
            console.error('[CapacitorGPS] Watch error:', err);
            setError(err.message);
            return;
          }
          if (position) {
            handlePositionUpdate(position);
          }
        }
      );

      watchIdRef.current = watchId;
      setIsTracking(true);
      toast.success('GPS tracking started');
      console.log('[CapacitorGPS] Tracking started, watchId:', watchId);
    } catch (err: any) {
      console.error('[CapacitorGPS] Start tracking error:', err);
      setError(err?.message || 'Failed to start GPS tracking');
      toast.error('Failed to start GPS tracking');
    }
  }, [busId, tripId, isTracking, checkPermissions, requestPermissions, handlePositionUpdate]);

  // Stop tracking
  const stopTracking = useCallback(async () => {
    if (watchIdRef.current) {
      try {
        await Geolocation.clearWatch({ id: watchIdRef.current });
        console.log('[CapacitorGPS] Watch cleared');
      } catch (err) {
        console.error('[CapacitorGPS] Error clearing watch:', err);
      }
      watchIdRef.current = null;
    }

    setIsTracking(false);
    toast.info('GPS tracking stopped');
  }, []);

  // Get current position once
  const getCurrentPosition = useCallback(async () => {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      handlePositionUpdate(position);
      return position;
    } catch (err: any) {
      console.error('[CapacitorGPS] Get position error:', err);
      setError(err?.message || 'Failed to get current position');
      return null;
    }
  }, [handlePositionUpdate]);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    console.log('[CapacitorGPS] Auto-start/stop effect', { enabled, busId, isTracking });

    if (enabled && busId && !isTracking) {
      console.log('[CapacitorGPS] Auto-starting tracking');
      startTracking();
    } else if (!enabled && isTracking) {
      console.log('[CapacitorGPS] Auto-stopping tracking');
      stopTracking();
    }

    return () => {
      if (watchIdRef.current) {
        console.log('[CapacitorGPS] Cleanup: clearing watch');
        Geolocation.clearWatch({ id: watchIdRef.current }).catch(console.error);
      }
    };
  }, [enabled, busId, isTracking, startTracking, stopTracking]);

  // Check permissions on mount
  useEffect(() => {
    checkPlatform();
    checkPermissions();
  }, [checkPlatform, checkPermissions]);

  return {
    position,
    isTracking,
    error,
    permissionStatus,
    isNative,
    startTracking,
    stopTracking,
    getCurrentPosition,
    requestPermissions,
  };
}


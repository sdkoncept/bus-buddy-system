import { useState, useEffect } from 'react';
import { useCapacitorGPS } from '@/hooks/useCapacitorGPS';
import { useAuth } from '@/contexts/AuthContext';
import { useDriverTrips, useStartTrip, useEndTrip } from '@/hooks/useDriverTrips';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  MapPin,
  Navigation,
  Play,
  Square,
  Bus,
  Route,
  Clock,
  Users,
  Signal,
  SignalZero,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface DriverInfo {
  id: string;
  busId: string | null;
  busRegistration: string | null;
}

export default function DriverAppPage() {
  const { user } = useAuth();
  const [driverInfo, setDriverInfo] = useState<DriverInfo | null>(null);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { data: trips, isLoading: tripsLoading, refetch: refetchTrips } = useDriverTrips(todayStr);
  const startTripMutation = useStartTrip();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const endTripMutation = useEndTrip();

  // Get current in-progress trip
  const activeTrip = trips?.find(t => t.status === 'in_progress');
  const currentTripId = activeTrip?.id || selectedTripId;

  // Track if we want GPS enabled
  const [gpsEnabled, setGpsEnabled] = useState(false);

  // Initialize GPS tracking
  const {
    position,
    isTracking,
    error: gpsError,
    permissionStatus,
    isNative,
    startTracking,
    stopTracking,
    getCurrentPosition,
    requestPermissions,
  } = useCapacitorGPS({
    tripId: currentTripId || undefined,
    busId: driverInfo?.busId || undefined,
    updateIntervalMs: 15000,
    enabled: gpsEnabled && !!driverInfo?.busId && !!currentTripId,
  });

  // Fetch driver info and assigned bus
  useEffect(() => {
    async function fetchDriverInfo() {
      if (!user?.id) return;

      try {
        // Get driver record
        const { data: driver, error: driverError } = await supabase
          .from('drivers')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (driverError || !driver) {
          console.error('Driver not found:', driverError);
          setIsLoadingDriver(false);
          return;
        }

        // Get assigned bus
        const { data: bus, error: busError } = await supabase
          .from('buses')
          .select('id, registration_number')
          .eq('current_driver_id', driver.id)
          .single();

        setDriverInfo({
          id: driver.id,
          busId: bus?.id || null,
          busRegistration: bus?.registration_number || null,
        });
      } catch (err) {
        console.error('Error fetching driver info:', err);
      } finally {
        setIsLoadingDriver(false);
      }
    }

    fetchDriverInfo();
  }, [user?.id]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetchTrips();
      setLastRefresh(new Date());
      toast.info('Data refreshed');
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [refetchTrips]);

  const handleStartTrip = async (tripId: string) => {
    try {
      await startTripMutation.mutateAsync(tripId);
      setSelectedTripId(tripId);
      setGpsEnabled(true);
      await startTracking();
    } catch (err) {
      console.error('Failed to start trip:', err);
    }
  };

  const handleEndTrip = async (tripId: string) => {
    try {
      await stopTracking();
      setGpsEnabled(false);
      await endTripMutation.mutateAsync(tripId);
      setSelectedTripId(null);
    } catch (err) {
      console.error('Failed to end trip:', err);
    }
  };

  const handleToggleTracking = async () => {
    if (isTracking) {
      await stopTracking();
      setGpsEnabled(false);
    } else {
      setGpsEnabled(true);
      await startTracking();
    }
  };

  if (isLoadingDriver) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading driver info...</p>
        </div>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Driver Not Found</h2>
            <p className="text-muted-foreground">
              Your account is not linked to a driver profile. Please contact admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6" />
            <span className="font-semibold text-lg">EagleLine Driver</span>
          </div>
          <Badge variant={isTracking ? "secondary" : "outline"} className="gap-1">
            {isTracking ? (
              <>
                <Signal className="h-3 w-3" />
                GPS Active
              </>
            ) : (
              <>
                <SignalZero className="h-3 w-3" />
                GPS Off
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Bus Info Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Bus className="h-4 w-4" />
              Assigned Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent>
            {driverInfo.busId ? (
              <div className="flex items-center justify-between">
                <span className="font-mono text-lg">{driverInfo.busRegistration}</span>
                <Badge variant="outline">Ready</Badge>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No bus assigned</p>
            )}
          </CardContent>
        </Card>

        {/* GPS Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              GPS Status
            </CardTitle>
            <CardDescription>
              {isNative ? 'Native GPS' : 'Web Geolocation'} • 
              Permission: {permissionStatus?.location || 'unknown'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gpsError && (
              <div className="bg-destructive/10 text-destructive text-sm p-2 rounded flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {gpsError}
              </div>
            )}

            {position ? (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground block text-xs">Latitude</span>
                  <span className="font-mono">{position.latitude.toFixed(6)}</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground block text-xs">Longitude</span>
                  <span className="font-mono">{position.longitude.toFixed(6)}</span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground block text-xs">Speed</span>
                  <span className="font-mono">
                    {position.speed != null ? `${(position.speed * 3.6).toFixed(1)} km/h` : 'N/A'}
                  </span>
                </div>
                <div className="bg-muted p-2 rounded">
                  <span className="text-muted-foreground block text-xs">Accuracy</span>
                  <span className="font-mono">{position.accuracy.toFixed(0)}m</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No position data yet
              </p>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleToggleTracking}
                variant={isTracking ? "destructive" : "default"}
                className="flex-1"
                disabled={!driverInfo.busId || !currentTripId}
              >
                {isTracking ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Tracking
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Tracking
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={getCurrentPosition}
                disabled={!driverInfo.busId}
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>

            {!driverInfo.busId && (
              <p className="text-xs text-muted-foreground text-center">
                No bus assigned - tracking disabled
              </p>
            )}
            {driverInfo.busId && !currentTripId && (
              <p className="text-xs text-muted-foreground text-center">
                Start a trip below to enable GPS tracking
              </p>
            )}
          </CardContent>
        </Card>

        {/* Today's Trips */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Route className="h-4 w-4" />
                Today's Trips
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => {
                refetchTrips();
                setLastRefresh(new Date());
                toast.info('Data refreshed');
              }}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tripsLoading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : trips && trips.length > 0 ? (
              <div className="space-y-3">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{trip.route?.name || 'Unknown Route'}</span>
                      <Badge variant={
                        trip.status === 'completed' ? 'default' :
                        trip.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {trip.departure_time?.slice(0, 5)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {trip.available_seats || 0} seats
                      </span>
                    </div>

                    {trip.status === 'scheduled' && (
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleStartTrip(trip.id)}
                        disabled={startTripMutation.isPending || !driverInfo.busId}
                      >
                        {startTripMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        Start Trip
                      </Button>
                    )}

                    {trip.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full mt-2"
                        onClick={() => handleEndTrip(trip.id)}
                        disabled={endTripMutation.isPending}
                      >
                        {endTripMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                        End Trip
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-4">
                No trips scheduled for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Platform Info */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Platform: {isNative ? 'Native Android' : 'Web Browser'}</p>
          <p className="mt-1">GPS updates every 15 seconds • Auto-refresh every 10 min</p>
          <p className="mt-1">Last refresh: {format(lastRefresh, 'HH:mm:ss')}</p>
        </div>
      </div>
    </div>
  );
}

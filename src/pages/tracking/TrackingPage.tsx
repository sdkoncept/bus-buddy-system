import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Bus, Clock, Navigation, Search, RefreshCw } from 'lucide-react';
import { useBuses } from '@/hooks/useBuses';
import { useSchedules } from '@/hooks/useSchedules';
import { useRoutes } from '@/hooks/useRoutes';
import { useMapboxToken } from '@/hooks/useMapboxToken';
import MapboxMap from '@/components/tracking/MapboxMap';

interface BusLocation {
  id: string;
  registration_number: string;
  model: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  route?: {
    name: string;
    origin: string;
    destination: string;
  };
}

export default function TrackingPage() {
  const { data: buses } = useBuses();
  const { data: schedules } = useSchedules();
  const { data: routes } = useRoutes();
  const { token: mapboxToken, loading: tokenLoading, error: tokenError } = useMapboxToken();
  
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [busLocations, setBusLocations] = useState<BusLocation[]>([]);

  const activeBuses = buses?.filter((b: any) => b.status === 'active') || [];
  
  const filteredBuses = busLocations.filter((bus) => 
    bus.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRouteForBus = useCallback((busId: string) => {
    const schedule = schedules?.find((s: any) => s.bus_id === busId);
    if (!schedule) return null;
    return routes?.find((r: any) => r.id === schedule.route_id);
  }, [schedules, routes]);

  // Initialize and simulate bus locations
  useEffect(() => {
    if (!activeBuses.length) return;

    // Initialize bus locations around Nairobi
    const initialLocations: BusLocation[] = activeBuses.map((bus: any, index: number) => {
      const route = getRouteForBus(bus.id);
      // Spread buses around Nairobi area
      const baseLatOffset = (Math.random() - 0.5) * 0.15;
      const baseLngOffset = (Math.random() - 0.5) * 0.15;
      
      return {
        id: bus.id,
        registration_number: bus.registration_number,
        model: bus.model,
        lat: -1.2921 + baseLatOffset,
        lng: 36.8219 + baseLngOffset,
        speed: Math.floor(Math.random() * 50) + 30,
        heading: Math.floor(Math.random() * 360),
        route: route ? {
          name: route.name,
          origin: route.origin,
          destination: route.destination,
        } : undefined,
      };
    });

    setBusLocations(initialLocations);
  }, [activeBuses.length, getRouteForBus]);

  // Simulate real-time movement
  useEffect(() => {
    if (!busLocations.length) return;

    const interval = setInterval(() => {
      setBusLocations(prev => prev.map(bus => {
        // Move bus slightly in its heading direction
        const headingRad = (bus.heading * Math.PI) / 180;
        const distance = 0.0005; // Small movement per tick
        
        // Occasionally change heading slightly
        const newHeading = bus.heading + (Math.random() - 0.5) * 20;
        
        return {
          ...bus,
          lat: bus.lat + Math.cos(headingRad) * distance,
          lng: bus.lng + Math.sin(headingRad) * distance,
          heading: newHeading % 360,
          speed: Math.max(20, Math.min(80, bus.speed + (Math.random() - 0.5) * 10)),
        };
      }));
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [busLocations.length]);

  const selectedBusData = busLocations.find(b => b.id === selectedBus);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Live Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track buses in real-time on the map
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bus List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" />
              Active Buses
            </CardTitle>
            <CardDescription>{busLocations.length} buses currently active</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-auto">
              {filteredBuses.map((bus) => (
                <div
                  key={bus.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedBus === bus.id 
                      ? 'bg-primary/10 border-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedBus(bus.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{bus.registration_number}</span>
                    <Badge variant="default" className="bg-success">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{bus.model}</p>
                  {bus.route && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {bus.route.origin} → {bus.route.destination}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3" />
                      {Math.round(bus.speed)} km/h
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Live
                    </span>
                  </div>
                </div>
              ))}

              {filteredBuses.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Bus className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active buses found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Live Map
            </CardTitle>
            <CardDescription>Real-time bus locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <MapboxMap
                buses={busLocations}
                selectedBusId={selectedBus}
                onBusSelect={setSelectedBus}
                mapboxToken={mapboxToken}
              />
            </div>

            {selectedBusData && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-2">Selected Bus Details</h4>
                <div className="grid gap-2 md:grid-cols-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Registration:</span>
                    <p className="font-medium">{selectedBusData.registration_number}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Speed:</span>
                    <p className="font-medium">{Math.round(selectedBusData.speed)} km/h</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Route:</span>
                    <p className="font-medium">{selectedBusData.route?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ETA:</span>
                    <p className="font-medium">~45 mins</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Bus, Clock, Navigation, Search, RefreshCw } from 'lucide-react';
import { useBuses } from '@/hooks/useBuses';
import { useSchedules } from '@/hooks/useSchedules';
import { useRoutes } from '@/hooks/useRoutes';

export default function TrackingPage() {
  const { data: buses } = useBuses();
  const { data: trips } = useSchedules();
  const { data: routes } = useRoutes();
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const activeBuses = buses?.filter((b: any) => b.status === 'active') || [];
  const filteredBuses = activeBuses.filter((bus: any) => 
    bus.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRandomLocation = () => ({
    lat: -1.2921 + (Math.random() - 0.5) * 0.1,
    lng: 36.8219 + (Math.random() - 0.5) * 0.1,
    speed: Math.floor(Math.random() * 80) + 20,
    heading: Math.floor(Math.random() * 360),
  });

  const getRouteForBus = (busId: string) => {
    const trip = trips?.find((t: any) => t.bus_id === busId);
    if (!trip) return null;
    return routes?.find((r: any) => r.id === trip.route_id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Live Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track buses in real-time on the map
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bus List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" />
              Active Buses
            </CardTitle>
            <CardDescription>{activeBuses.length} buses currently active</CardDescription>
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
              {filteredBuses.map((bus: any) => {
                const route = getRouteForBus(bus.id);
                const location = getRandomLocation();
                
                return (
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
                    {route && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {route.origin} → {route.destination}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs">
                      <span className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        {location.speed} km/h
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Updated just now
                      </span>
                    </div>
                  </div>
                );
              })}

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
            <div className="relative h-[500px] bg-muted rounded-lg overflow-hidden">
              {/* Placeholder Map */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Map integration would display real-time bus locations. 
                    Connect a mapping service like Google Maps or Mapbox for live tracking.
                  </p>
                </div>
              </div>

              {/* Bus markers (simulated) */}
              {activeBuses.slice(0, 5).map((bus: any, index: number) => {
                const top = 20 + (index * 15);
                const left = 20 + (index * 12);
                return (
                  <div
                    key={bus.id}
                    className="absolute w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg"
                    style={{ top: `${top}%`, left: `${left}%` }}
                    onClick={() => setSelectedBus(bus.id)}
                  >
                    <Bus className="h-4 w-4 text-primary-foreground" />
                  </div>
                );
              })}
            </div>

            {selectedBus && (
              <div className="mt-4 p-4 rounded-lg bg-muted">
                <h4 className="font-semibold mb-2">Selected Bus Details</h4>
                {(() => {
                  const bus = buses?.find((b: any) => b.id === selectedBus);
                  const route = getRouteForBus(selectedBus);
                  const location = getRandomLocation();
                  
                  return (
                    <div className="grid gap-2 md:grid-cols-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Registration:</span>
                        <p className="font-medium">{bus?.registration_number}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Speed:</span>
                        <p className="font-medium">{location.speed} km/h</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Route:</span>
                        <p className="font-medium">{route?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ETA:</span>
                        <p className="font-medium">~45 mins</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

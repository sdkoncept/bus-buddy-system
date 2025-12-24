import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Search, Bus, Clock, MapPin, Users, CreditCard } from 'lucide-react';
import { useRoutes } from '@/hooks/useRoutes';
import { useSchedules } from '@/hooks/useSchedules';
import { useCreateBooking } from '@/hooks/useBookings';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function BookTicketPage() {
  const { user } = useAuth();
  const { data: routes } = useRoutes();
  const { data: trips } = useSchedules();
  const createBooking = useCreateBooking();
  
  const [searchDate, setSearchDate] = useState<Date | undefined>(new Date());
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [passengerCount, setPassengerCount] = useState(1);
  const [step, setStep] = useState<'search' | 'select' | 'confirm'>('search');

  const handleSearch = () => {
    if (!searchDate || !selectedRoute) {
      toast.error('Please select a route and date');
      return;
    }

    const dateStr = format(searchDate, 'yyyy-MM-dd');
    const filtered = trips?.filter(
      (trip: any) => trip.route_id === selectedRoute && trip.trip_date === dateStr
    ) || [];
    
    setSearchResults(filtered);
    setStep('select');
    
    if (filtered.length === 0) {
      toast.info('No trips available for this route and date');
    }
  };

  const handleSelectTrip = (trip: any) => {
    setSelectedTrip(trip);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!selectedTrip || !user) {
      toast.error('Please select a trip');
      return;
    }

    try {
      const seatNumbers = Array.from({ length: passengerCount }, (_, i) => i + 1);
      const route = routes?.find((r: any) => r.id === selectedTrip.route_id);
      const totalFare = (route?.base_fare || 0) * passengerCount;

      await createBooking.mutateAsync({
        user_id: user.id,
        trip_id: selectedTrip.id,
        seat_numbers: seatNumbers,
        passenger_count: passengerCount,
        total_fare: totalFare,
        status: 'confirmed',
        payment_method: 'card',
      });

      toast.success('Booking confirmed successfully!');
      setStep('search');
      setSelectedTrip(null);
      setSearchResults([]);
    } catch (error) {
      toast.error('Failed to create booking');
    }
  };

  const getRouteDetails = (routeId: string) => {
    return routes?.find((r: any) => r.id === routeId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">Book a Ticket</h1>
        <p className="text-muted-foreground mt-1">
          Search for available trips and book your seat
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        <Badge variant={step === 'search' ? 'default' : 'secondary'}>1. Search</Badge>
        <Separator className="w-8" />
        <Badge variant={step === 'select' ? 'default' : 'secondary'}>2. Select Trip</Badge>
        <Separator className="w-8" />
        <Badge variant={step === 'confirm' ? 'default' : 'secondary'}>3. Confirm</Badge>
      </div>

      {step === 'search' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Search Trips
            </CardTitle>
            <CardDescription>Find available buses for your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Select Route</Label>
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes?.map((route: any) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} ({route.origin} → {route.destination})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Travel Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !searchDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {searchDate ? format(searchDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={searchDate}
                      onSelect={setSearchDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Passengers</Label>
                <Select 
                  value={passengerCount.toString()} 
                  onValueChange={(v) => setPassengerCount(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} Passenger{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSearch} className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" />
              Search Trips
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'select' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Trips</h2>
            <Button variant="outline" onClick={() => setStep('search')}>
              Modify Search
            </Button>
          </div>

          {searchResults.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No trips found for this route and date</p>
                <Button variant="outline" className="mt-4" onClick={() => setStep('search')}>
                  Try Different Search
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {searchResults.map((trip: any) => {
                const route = getRouteDetails(trip.route_id);
                return (
                  <Card key={trip.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleSelectTrip(trip)}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bus className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{route?.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {route?.origin} → {route?.destination}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Departure
                            </div>
                            <p className="font-semibold">{trip.departure_time}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              Arrival
                            </div>
                            <p className="font-semibold">{trip.arrival_time}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-4 w-4" />
                              Seats
                            </div>
                            <Badge variant="secondary">{trip.available_seats || 40} left</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-primary">
                              ${route?.base_fare || 0}
                            </p>
                            <p className="text-xs text-muted-foreground">per person</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {step === 'confirm' && selectedTrip && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const route = getRouteDetails(selectedTrip.route_id);
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Route</span>
                      <span className="font-medium">{route?.name}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">From</span>
                      <span className="font-medium">{route?.origin}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">To</span>
                      <span className="font-medium">{route?.destination}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium">{selectedTrip.trip_date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Departure</span>
                      <span className="font-medium">{selectedTrip.departure_time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Arrival</span>
                      <span className="font-medium">{selectedTrip.arrival_time}</span>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                const route = getRouteDetails(selectedTrip.route_id);
                const totalFare = (route?.base_fare || 0) * passengerCount;
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passengers</span>
                      <span className="font-medium">{passengerCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fare per person</span>
                      <span className="font-medium">${route?.base_fare || 0}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-primary">${totalFare}</span>
                    </div>

                    <div className="pt-4 space-y-3">
                      <Button onClick={handleConfirmBooking} className="w-full" disabled={createBooking.isPending}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        {createBooking.isPending ? 'Processing...' : 'Confirm & Pay'}
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => setStep('select')}>
                        Back to Trip Selection
                      </Button>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

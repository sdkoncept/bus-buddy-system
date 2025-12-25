import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Search, 
  MapPin, 
  Ticket,
  UserCheck,
  Bus
} from 'lucide-react';
import { format } from 'date-fns';

interface TripWithPassengers {
  id: string;
  trip_date: string;
  departure_time: string;
  status: string | null;
  route: {
    name: string;
    origin: string;
    destination: string;
  } | null;
  bus: {
    registration_number: string;
  } | null;
  bookings: {
    id: string;
    booking_number: string;
    passenger_count: number;
    seat_numbers: number[];
    status: string;
    boarding_stop: { stop_name: string } | null;
    alighting_stop: { stop_name: string } | null;
  }[];
}

export default function DriverPassengersPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch today's trip with passengers
  const { data: currentTrip, isLoading } = useQuery({
    queryKey: ['driver-current-trip-passengers', user?.id],
    queryFn: async () => {
      // Get driver ID
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (driverError) throw driverError;
      if (!driverData) return null;

      // Get today's active trip
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select(`
          id,
          trip_date,
          departure_time,
          status,
          route:routes(name, origin, destination),
          bus:buses(registration_number)
        `)
        .eq('driver_id', driverData.id)
        .eq('trip_date', today)
        .in('status', ['scheduled', 'in_progress'])
        .order('departure_time', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (tripError) throw tripError;
      if (!tripData) return null;

      // Get passengers for this trip
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_number,
          passenger_count,
          seat_numbers,
          status,
          boarding_stop:route_stops!bookings_boarding_stop_id_fkey(stop_name),
          alighting_stop:route_stops!bookings_alighting_stop_id_fkey(stop_name)
        `)
        .eq('trip_id', tripData.id)
        .in('status', ['confirmed', 'completed']);

      if (bookingsError) throw bookingsError;

      return {
        ...tripData,
        bookings: bookingsData || [],
      } as TripWithPassengers;
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const filteredBookings = currentTrip?.bookings.filter(booking =>
    booking.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.seat_numbers.some(seat => seat.toString().includes(searchTerm))
  ) || [];

  const totalPassengers = filteredBookings.reduce((sum, b) => sum + b.passenger_count, 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!currentTrip) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Passenger Manifest</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No active trip</h3>
            <p className="text-muted-foreground text-center">
              You don't have any scheduled or in-progress trips today
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Passenger Manifest</h1>
        <p className="text-muted-foreground">
          {currentTrip.route?.origin} → {currentTrip.route?.destination}
        </p>
      </div>

      {/* Trip Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Bus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{currentTrip.bus?.registration_number}</p>
                <p className="text-sm text-muted-foreground">
                  Departure: {currentTrip.departure_time}
                </p>
              </div>
            </div>
            <div className="text-right">
              <Badge className={currentTrip.status === 'in_progress' ? 'bg-info text-info-foreground' : ''}>
                {currentTrip.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Ticket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{filteredBookings.length}</p>
              <p className="text-sm text-muted-foreground">Bookings</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPassengers}</p>
              <p className="text-sm text-muted-foreground">Passengers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by booking number or seat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Passenger List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bookings ({filteredBookings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBookings.length > 0 ? (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="p-4 bg-muted/50 rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-primary" />
                      <span className="font-semibold">{booking.booking_number}</span>
                    </div>
                    <Badge variant="outline">
                      {booking.passenger_count} {booking.passenger_count === 1 ? 'passenger' : 'passengers'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-success" />
                    <span className="text-muted-foreground">Board:</span>
                    <span>{booking.boarding_stop?.stop_name || 'Origin'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-destructive" />
                    <span className="text-muted-foreground">Alight:</span>
                    <span>{booking.alighting_stop?.stop_name || 'Destination'}</span>
                  </div>

                  <div className="pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Seats: </span>
                    <span className="font-medium">
                      {booking.seat_numbers.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No passengers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
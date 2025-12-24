import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Search, Ticket, Calendar, MapPin, Clock, X } from 'lucide-react';
import { useBookings, useCancelBooking } from '@/hooks/useBookings';
import { useRoutes } from '@/hooks/useRoutes';
import { useSchedules } from '@/hooks/useSchedules';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/currency';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useBookings();
  const { data: routes } = useRoutes();
  const { data: trips } = useSchedules();
  const cancelBooking = useCancelBooking();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancellationReason, setCancellationReason] = useState('');

  // Filter bookings for current user
  const userBookings = bookings?.filter((b: any) => b.user_id === user?.id) || [];
  
  const filteredBookings = userBookings.filter((booking: any) =>
    booking.booking_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      confirmed: 'default',
      pending: 'secondary',
      cancelled: 'destructive',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getTripDetails = (tripId: string) => {
    return trips?.find((t: any) => t.id === tripId);
  };

  const getRouteDetails = (routeId: string) => {
    return routes?.find((r: any) => r.id === routeId);
  };

  const handleCancelClick = (booking: any) => {
    setSelectedBooking(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      await cancelBooking.mutateAsync({
        id: selectedBooking.id,
        reason: cancellationReason,
      });
      toast.success('Booking cancelled successfully');
      setCancelDialogOpen(false);
      setSelectedBooking(null);
      setCancellationReason('');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-1">
          View and manage your trip bookings
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userBookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {userBookings.filter((b: any) => b.status === 'confirmed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {userBookings.filter((b: any) => b.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {userBookings.filter((b: any) => b.status === 'cancelled').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by booking number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookings Found</h3>
            <p className="text-muted-foreground mb-4">
              {userBookings.length === 0 
                ? "You haven't made any bookings yet" 
                : "No bookings match your search"}
            </p>
            <Button asChild>
              <a href="/book">Book a Ticket</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredBookings.map((booking: any) => {
            const trip = getTripDetails(booking.trip_id);
            const route = trip ? getRouteDetails(trip.route_id) : null;
            
            return (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Ticket className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{booking.booking_number}</h3>
                          {getStatusBadge(booking.status)}
                        </div>
                        {route && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {route.origin} → {route.destination}
                          </div>
                        )}
                        {trip && (
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {trip.departure_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {trip.departure_time}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Total Fare</p>
                        <p className="text-xl font-bold text-primary">{formatCurrency(booking.total_fare)}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.passenger_count} passenger{booking.passenger_count > 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      {booking.status === 'confirmed' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleCancelClick(booking)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>

                  {booking.cancellation_reason && (
                    <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm font-medium">Cancellation Reason:</p>
                      <p className="text-sm text-muted-foreground">{booking.cancellation_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel booking {selectedBooking?.booking_number}? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for cancellation (optional)</label>
              <Textarea
                placeholder="Please provide a reason..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Booking
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmCancel}
              disabled={cancelBooking.isPending}
            >
              {cancelBooking.isPending ? 'Cancelling...' : 'Confirm Cancel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

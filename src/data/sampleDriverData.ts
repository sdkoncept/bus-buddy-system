// Sample data for driver pages when no real data exists

export const sampleTrips = [
  {
    id: 'sample-trip-1',
    trip_date: new Date().toISOString().split('T')[0],
    departure_time: '06:30',
    arrival_time: '10:45',
    status: 'scheduled',
    available_seats: 38,
    route: {
      name: 'Lagos - Ibadan Express',
      origin: 'Lagos (Jibowu)',
      destination: 'Ibadan (Challenge)',
      distance_km: 128,
      estimated_duration_minutes: 135,
    },
    bus: {
      registration_number: 'LAG-234-XY',
      model: 'Toyota Coaster',
      capacity: 42,
    },
  },
  {
    id: 'sample-trip-2',
    trip_date: new Date().toISOString().split('T')[0],
    departure_time: '14:00',
    arrival_time: '18:30',
    status: 'scheduled',
    available_seats: 25,
    route: {
      name: 'Lagos - Benin Route',
      origin: 'Lagos (Ojota)',
      destination: 'Benin City (Ring Road)',
      distance_km: 312,
      estimated_duration_minutes: 270,
    },
    bus: {
      registration_number: 'LAG-567-AB',
      model: 'Mercedes Sprinter',
      capacity: 32,
    },
  },
  {
    id: 'sample-trip-3',
    trip_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    departure_time: '07:00',
    arrival_time: '09:30',
    status: 'scheduled',
    available_seats: 45,
    route: {
      name: 'Lagos - Abeokuta',
      origin: 'Lagos (Berger)',
      destination: 'Abeokuta (Panseke)',
      distance_km: 77,
      estimated_duration_minutes: 90,
    },
    bus: {
      registration_number: 'LAG-890-CD',
      model: 'Higer Bus',
      capacity: 49,
    },
  },
];

export const samplePassengers = [
  {
    id: 'booking-1',
    booking_number: 'BK20251225001',
    passenger_count: 2,
    seat_numbers: [5, 6],
    status: 'confirmed',
    boarding_stop: { stop_name: 'Lagos (Jibowu)' },
    alighting_stop: { stop_name: 'Ibadan (Challenge)' },
  },
  {
    id: 'booking-2',
    booking_number: 'BK20251225002',
    passenger_count: 1,
    seat_numbers: [12],
    status: 'confirmed',
    boarding_stop: { stop_name: 'Lagos (Jibowu)' },
    alighting_stop: { stop_name: 'Sagamu Junction' },
  },
  {
    id: 'booking-3',
    booking_number: 'BK20251225003',
    passenger_count: 3,
    seat_numbers: [18, 19, 20],
    status: 'confirmed',
    boarding_stop: { stop_name: 'Berger' },
    alighting_stop: { stop_name: 'Ibadan (Challenge)' },
  },
  {
    id: 'booking-4',
    booking_number: 'BK20251225004',
    passenger_count: 1,
    seat_numbers: [25],
    status: 'confirmed',
    boarding_stop: { stop_name: 'Lagos (Jibowu)' },
    alighting_stop: { stop_name: 'Ibadan (Iwo Road)' },
  },
  {
    id: 'booking-5',
    booking_number: 'BK20251225005',
    passenger_count: 4,
    seat_numbers: [30, 31, 32, 33],
    status: 'confirmed',
    boarding_stop: { stop_name: 'Mowe' },
    alighting_stop: { stop_name: 'Ibadan (Challenge)' },
  },
];

export const sampleIncidents = [
  {
    id: 'incident-1',
    incident_type: 'traffic_delay',
    description: 'Heavy traffic congestion at Third Mainland Bridge due to an accident ahead. Delayed by approximately 45 minutes.',
    severity: 'medium',
    status: 'resolved',
    reported_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    location_description: 'Third Mainland Bridge, Lagos',
    latitude: 6.4541,
    longitude: 3.4082,
    bus: { registration_number: 'LAG-234-XY' },
  },
  {
    id: 'incident-2',
    incident_type: 'breakdown',
    description: 'Engine overheating warning light came on. Pulled over safely and called for roadside assistance. Coolant leak detected.',
    severity: 'high',
    status: 'resolved',
    reported_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    location_description: 'Near Sagamu Interchange',
    latitude: 6.8289,
    longitude: 3.6369,
    bus: { registration_number: 'LAG-567-AB' },
  },
  {
    id: 'incident-3',
    incident_type: 'passenger_issue',
    description: 'Passenger became unwell during journey. Stopped at nearest clinic in Ore town for medical attention. Passenger later continued journey.',
    severity: 'medium',
    status: 'resolved',
    reported_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    location_description: 'Ore Town, Ondo State',
    latitude: 6.7510,
    longitude: 4.8757,
    bus: { registration_number: 'LAG-890-CD' },
  },
  {
    id: 'incident-4',
    incident_type: 'fuel_issue',
    description: 'Low fuel warning despite recent fill-up. Suspected fuel gauge malfunction. Proceeded to nearest fuel station to top up as precaution.',
    severity: 'low',
    status: 'reported',
    reported_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    location_description: 'Along Lagos-Ibadan Expressway',
    latitude: 6.7089,
    longitude: 3.5126,
    bus: { registration_number: 'LAG-234-XY' },
  },
];

export const sampleCurrentTrip = {
  id: 'current-trip',
  trip_date: new Date().toISOString().split('T')[0],
  departure_time: '06:30',
  status: 'in_progress',
  route: {
    name: 'Lagos - Ibadan Express',
    origin: 'Lagos (Jibowu)',
    destination: 'Ibadan (Challenge)',
  },
  bus: {
    registration_number: 'LAG-234-XY',
  },
  bookings: samplePassengers,
};

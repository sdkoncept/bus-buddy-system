export type AppRole = 'admin' | 'driver' | 'passenger' | 'storekeeper' | 'mechanic' | 'staff' | 'accounts';
export type BusStatus = 'active' | 'maintenance' | 'out_of_service';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type WorkOrderStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Bus {
  id: string;
  registration_number: string;
  model: string;
  manufacturer?: string;
  year?: number;
  capacity: number;
  status: BusStatus;
  current_driver_id?: string;
  fuel_type?: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  mileage?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: string;
  user_id?: string;
  license_number: string;
  license_expiry: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  hire_date?: string;
  status?: string;
  rating?: number;
  total_trips?: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance_km?: number;
  estimated_duration_minutes?: number;
  base_fare: number;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: string;
  route_id: string;
  stop_name: string;
  stop_order: number;
  distance_from_origin_km?: number;
  estimated_time_from_origin_minutes?: number;
  fare_from_origin?: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

export interface Schedule {
  id: string;
  route_id: string;
  bus_id?: string;
  driver_id?: string;
  departure_time: string;
  arrival_time: string;
  days_of_week?: number[];
  is_active?: boolean;
  effective_from?: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
  route?: Route;
  bus?: Bus;
  driver?: Driver;
}

export interface Trip {
  id: string;
  schedule_id?: string;
  route_id: string;
  bus_id?: string;
  driver_id?: string;
  trip_date: string;
  departure_time: string;
  actual_departure_time?: string;
  arrival_time: string;
  actual_arrival_time?: string;
  status?: string;
  available_seats?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  route?: Route;
  bus?: Bus;
  driver?: Driver;
}

export interface Booking {
  id: string;
  booking_number: string;
  user_id: string;
  trip_id: string;
  boarding_stop_id?: string;
  alighting_stop_id?: string;
  seat_numbers: number[];
  passenger_count: number;
  total_fare: number;
  status: BookingStatus;
  payment_status?: string;
  payment_method?: string;
  booked_at: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  trip?: Trip;
}

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  category_id?: string;
  name: string;
  sku?: string;
  description?: string;
  quantity: number;
  min_quantity?: number;
  unit?: string;
  unit_cost?: number;
  location?: string;
  supplier?: string;
  created_at: string;
  updated_at: string;
  category?: InventoryCategory;
}

export interface MaintenanceRecord {
  id: string;
  bus_id: string;
  type: string;
  description?: string;
  scheduled_date: string;
  completed_date?: string;
  status: MaintenanceStatus;
  cost?: number;
  mechanic_id?: string;
  odometer_reading?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  bus?: Bus;
}

export interface WorkOrder {
  id: string;
  maintenance_id?: string;
  bus_id: string;
  assigned_to?: string;
  title: string;
  description?: string;
  priority?: string;
  status: WorkOrderStatus;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  bus?: Bus;
}

export interface PartsUsage {
  id: string;
  work_order_id: string;
  item_id: string;
  quantity: number;
  issued_by?: string;
  issued_at: string;
  item?: InventoryItem;
}

export interface Transaction {
  id: string;
  type: string;
  category: string;
  amount: number;
  description?: string;
  reference_id?: string;
  reference_type?: string;
  date: string;
  created_by?: string;
  created_at: string;
}

export interface Payroll {
  id: string;
  driver_id: string;
  period_start: string;
  period_end: string;
  base_salary: number;
  bonus?: number;
  deductions?: number;
  net_amount: number;
  status?: string;
  paid_at?: string;
  created_at: string;
  driver?: Driver;
}

export interface BusLocation {
  id: string;
  bus_id: string;
  trip_id?: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  recorded_at: string;
}

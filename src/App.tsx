import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import FleetPage from "./pages/fleet/FleetPage";
import DriversPage from "./pages/drivers/DriversPage";
import RoutesPage from "./pages/routes/RoutesPage";
import SchedulesPage from "./pages/schedules/SchedulesPage";
import BookingsPage from "./pages/bookings/BookingsPage";
import MaintenancePage from "./pages/maintenance/MaintenancePage";
import InventoryPage from "./pages/inventory/InventoryPage";
import AccountsPage from "./pages/accounts/AccountsPage";
import CustomerServicePage from "./pages/customer-service/CustomerServicePage";
import BookTicketPage from "./pages/passenger/BookTicketPage";
import MyBookingsPage from "./pages/passenger/MyBookingsPage";
import SettingsPage from "./pages/settings/SettingsPage";
import ReportsPage from "./pages/reports/ReportsPage";
import TrackingPage from "./pages/tracking/TrackingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              {/* Dashboard - accessible by all authenticated users */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<SettingsPage />} />
              
              {/* Admin & Staff routes */}
              <Route path="/fleet" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <FleetPage />
                </ProtectedRoute>
              } />
              <Route path="/drivers" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <DriversPage />
                </ProtectedRoute>
              } />
              <Route path="/routes" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <RoutesPage />
                </ProtectedRoute>
              } />
              <Route path="/schedules" element={
                <ProtectedRoute allowedRoles={['admin', 'staff', 'driver']}>
                  <SchedulesPage />
                </ProtectedRoute>
              } />
              <Route path="/bookings" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <BookingsPage />
                </ProtectedRoute>
              } />
              <Route path="/tracking" element={
                <ProtectedRoute allowedRoles={['admin', 'staff', 'passenger']}>
                  <TrackingPage />
                </ProtectedRoute>
              } />
              
              {/* Maintenance - Admin, Staff, Mechanic */}
              <Route path="/maintenance" element={
                <ProtectedRoute allowedRoles={['admin', 'staff', 'mechanic']}>
                  <MaintenancePage />
                </ProtectedRoute>
              } />
              <Route path="/work-orders" element={
                <ProtectedRoute allowedRoles={['admin', 'mechanic']}>
                  <MaintenancePage />
                </ProtectedRoute>
              } />
              
              {/* Inventory - Admin, Staff, Storekeeper, Mechanic */}
              <Route path="/inventory" element={
                <ProtectedRoute allowedRoles={['admin', 'staff', 'storekeeper', 'mechanic']}>
                  <InventoryPage />
                </ProtectedRoute>
              } />
              <Route path="/parts-requests" element={
                <ProtectedRoute allowedRoles={['admin', 'storekeeper', 'mechanic']}>
                  <InventoryPage />
                </ProtectedRoute>
              } />
              
              {/* Accounts - Admin, Accounts */}
              <Route path="/accounts" element={
                <ProtectedRoute allowedRoles={['admin', 'accounts']}>
                  <AccountsPage />
                </ProtectedRoute>
              } />
              <Route path="/payroll" element={
                <ProtectedRoute allowedRoles={['admin', 'accounts']}>
                  <AccountsPage />
                </ProtectedRoute>
              } />
              
              {/* Customer Service - Admin, Staff */}
              <Route path="/customer-service" element={
                <ProtectedRoute allowedRoles={['admin', 'staff']}>
                  <CustomerServicePage />
                </ProtectedRoute>
              } />
              
              {/* Reports - Admin only */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ReportsPage />
                </ProtectedRoute>
              } />
              
              {/* Passenger routes */}
              <Route path="/book" element={
                <ProtectedRoute allowedRoles={['admin', 'staff', 'passenger']}>
                  <BookTicketPage />
                </ProtectedRoute>
              } />
              <Route path="/my-bookings" element={
                <ProtectedRoute allowedRoles={['admin', 'passenger']}>
                  <MyBookingsPage />
                </ProtectedRoute>
              } />
              
              {/* Driver routes */}
              <Route path="/trips" element={
                <ProtectedRoute allowedRoles={['admin', 'driver']}>
                  <SchedulesPage />
                </ProtectedRoute>
              } />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

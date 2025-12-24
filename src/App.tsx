import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/fleet" element={<FleetPage />} />
              <Route path="/drivers" element={<DriversPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/schedules" element={<SchedulesPage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/tracking" element={<TrackingPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/inventory" element={<InventoryPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/customer-service" element={<CustomerServicePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/book" element={<BookTicketPage />} />
              <Route path="/my-bookings" element={<MyBookingsPage />} />
              <Route path="/trips" element={<SchedulesPage />} />
              <Route path="/work-orders" element={<MaintenancePage />} />
              <Route path="/parts-requests" element={<InventoryPage />} />
              <Route path="/payroll" element={<AccountsPage />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

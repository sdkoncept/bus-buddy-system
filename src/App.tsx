import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

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
              <Route path="/fleet" element={<Dashboard />} />
              <Route path="/drivers" element={<Dashboard />} />
              <Route path="/routes" element={<Dashboard />} />
              <Route path="/schedules" element={<Dashboard />} />
              <Route path="/bookings" element={<Dashboard />} />
              <Route path="/tracking" element={<Dashboard />} />
              <Route path="/maintenance" element={<Dashboard />} />
              <Route path="/inventory" element={<Dashboard />} />
              <Route path="/accounts" element={<Dashboard />} />
              <Route path="/reports" element={<Dashboard />} />
              <Route path="/settings" element={<Dashboard />} />
              <Route path="/book" element={<Dashboard />} />
              <Route path="/my-bookings" element={<Dashboard />} />
              <Route path="/trips" element={<Dashboard />} />
              <Route path="/work-orders" element={<Dashboard />} />
              <Route path="/parts-requests" element={<Dashboard />} />
              <Route path="/payroll" element={<Dashboard />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

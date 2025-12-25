import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bus, Users, Route, Ticket, TrendingUp, AlertTriangle } from 'lucide-react';
import { PendingApprovalsWidget } from '@/components/dashboard/PendingApprovalsWidget';
import { MechanicDashboard } from '@/components/dashboard/MechanicDashboard';

const stats = [
  { title: 'Total Buses', value: '12', icon: Bus, color: 'text-primary', change: '+2 this month' },
  { title: 'Active Drivers', value: '18', icon: Users, color: 'text-success', change: '3 on leave' },
  { title: 'Active Routes', value: '8', icon: Route, color: 'text-info', change: '2 new routes' },
  { title: "Today's Bookings", value: '156', icon: Ticket, color: 'text-warning', change: '+12% from yesterday' },
];

const recentActivity = [
  { id: 1, action: 'New booking', details: 'BK20241224001 - Route A to B', time: '5 min ago' },
  { id: 2, action: 'Bus maintenance completed', details: 'KA-01-AB-1234 - Oil change', time: '1 hour ago' },
  { id: 3, action: 'Driver assigned', details: 'John Doe assigned to Route C', time: '2 hours ago' },
  { id: 4, action: 'New route created', details: 'City Center to Airport', time: '3 hours ago' },
];

export default function Dashboard() {
  const { profile, role } = useAuth();

  // Show mechanic-specific dashboard
  if (role === 'mechanic') {
    return <MechanicDashboard />;
  }

  // Default dashboard for other roles
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-bold">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your fleet today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Approvals Widget - for admin and storekeeper */}
      <PendingApprovalsWidget />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Alerts & Reminders
            </CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
                <p className="font-medium text-sm">3 buses due for maintenance</p>
                <p className="text-xs text-muted-foreground mt-1">Schedule service within 7 days</p>
              </div>
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="font-medium text-sm">2 driver licenses expiring</p>
                <p className="text-xs text-muted-foreground mt-1">Renewal required by month end</p>
              </div>
              <div className="p-3 rounded-lg bg-info/10 border border-info/20">
                <p className="font-medium text-sm">Low inventory alert</p>
                <p className="text-xs text-muted-foreground mt-1">5 items below minimum stock</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Clock, Shield, Users, BarChart3, ArrowRight, CheckCircle } from 'lucide-react';

const Index = () => {
  const features = [
    {
      icon: Bus,
      title: 'Fleet Management',
      description: 'Track and manage your entire bus fleet with real-time status updates and maintenance schedules.',
    },
    {
      icon: MapPin,
      title: 'Route Planning',
      description: 'Optimize routes for efficiency with smart scheduling and multi-stop management.',
    },
    {
      icon: Clock,
      title: 'Real-Time Tracking',
      description: 'Monitor bus locations and arrival times with GPS-enabled live tracking.',
    },
    {
      icon: Users,
      title: 'Driver Management',
      description: 'Manage driver schedules, assignments, and performance all in one place.',
    },
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Safe and seamless ticket booking with multiple payment options.',
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive insights into operations, revenue, and performance metrics.',
    },
  ];

  const benefits = [
    'Reduce operational costs by up to 30%',
    'Increase fleet utilization and efficiency',
    'Improve customer satisfaction with real-time updates',
    'Streamline maintenance scheduling',
    'Centralized management for multi-location operations',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Bus className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SD Koncept BMS</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/auth">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Trusted by transport companies across Nigeria</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Modern Bus Management
            <span className="block gradient-text">Made Simple</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Streamline your transport operations with our comprehensive bus management system. 
            From fleet tracking to ticket booking, manage everything in one powerful platform.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gap-2 h-12 px-8" asChild>
              <Link to="/auth">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 h-12 px-8" asChild>
              <Link to="/auth">Book a Ticket</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to Manage Your Fleet
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A complete solution for modern bus transport management, designed for efficiency and growth.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-glow transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Transform Your Transport Business
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join leading transport companies that have modernized their operations with our comprehensive management platform.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-success shrink-0 mt-0.5" />
                    <span className="text-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="mt-8 gap-2" asChild>
                <Link to="/auth">
                  Get Started Today
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl gradient-primary p-1">
                <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-24 h-24 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6">
                      <Bus className="h-12 w-12 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">SD Koncept BMS</h3>
                    <p className="text-muted-foreground">Your Complete Bus Management Solution</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl gradient-primary p-[2px]">
            <div className="rounded-3xl bg-card p-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Modernize Your Fleet?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Start your free trial today and see how our platform can transform your transport operations.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="gap-2 h-12 px-8" asChild>
                  <Link to="/auth">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Bus className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">SD Koncept BMS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SD Koncept. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

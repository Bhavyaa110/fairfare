import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Car, TrendingUp, Star, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  provider: string;
  pickup_location: string;
  dropoff_location: string;
  fare: number;
  rating: number | null;
  created_at: string;
  status: string;
}

const Dashboard = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Error",
            description: "Please log in to view your dashboard",
            variant: "destructive",
          });
          return;
        }

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setBookings(data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [toast]);

  // Calculate stats from real data
  const totalRides = bookings.length;
  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.fare), 0);
  const ratingsGiven = bookings.filter(b => b.rating !== null);
  const avgRating = ratingsGiven.length > 0 
    ? (ratingsGiven.reduce((sum, b) => sum + (b.rating || 0), 0) / ratingsGiven.length).toFixed(1)
    : "N/A";
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthRides = bookings.filter(b => {
    const bookingDate = new Date(b.created_at);
    return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
  }).length;

  // Calculate provider breakdown
  const providerStats = bookings.reduce((acc, booking) => {
    const provider = booking.provider;
    if (!acc[provider]) {
      acc[provider] = { name: provider, rides: 0, amount: 0 };
    }
    acc[provider].rides += 1;
    acc[provider].amount += Number(booking.fare);
    return acc;
  }, {} as Record<string, { name: string; rides: number; amount: number }>);

  const providers = Object.values(providerStats).sort((a, b) => b.rides - a.rides);

  const stats = [
    {
      icon: Car,
      label: "Total Rides",
      value: totalRides.toString(),
      color: "bg-primary"
    },
    {
      icon: TrendingUp,
      label: "Amount Spent",
      value: `₹${totalSpent.toFixed(0)}`,
      color: "bg-success"
    },
    {
      icon: Star,
      label: "Avg Rating",
      value: avgRating,
      color: "bg-yellow-500"
    },
    {
      icon: Calendar,
      label: "This Month",
      value: `${thisMonthRides} rides`,
      color: "bg-accent"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl"
        >
          <h1 className="mb-8 text-3xl font-bold text-foreground">Dashboard</h1>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Provider Breakdown */}
          <Card className="p-6">
            <h2 className="mb-6 text-xl font-semibold text-foreground">
              Provider Breakdown
            </h2>
            
            {providers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {providers.map((provider, index) => {
                  const maxRides = Math.max(...providers.map(p => p.rides));
                  const percentage = (provider.rides / maxRides) * 100;
                
                return (
                  <div key={provider.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-foreground">{provider.name}</span>
                      <div className="text-right">
                        <span className="font-semibold text-foreground">{provider.rides} rides</span>
                        <span className="ml-2 text-sm text-muted-foreground">
                          ₹{provider.amount}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.2, duration: 0.5 }}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                );
                })}
              </div>
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="mt-6 p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">
              Recent Activity
            </h2>
            {bookings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {booking.pickup_location} → {booking.dropoff_location}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        via {booking.provider} • {new Date(booking.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <span className="font-semibold text-primary">₹{Number(booking.fare).toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

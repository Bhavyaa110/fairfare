import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MapPin, Navigation, Download, Star } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Trip {
  id: string;
  provider: string;
  pickup: string;
  dropoff: string;
  fare: number;
  date: string;
  status: "completed" | "cancelled";
  rating?: number;
}

const History = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Error",
            description: "Please log in to view your trip history",
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

        const formattedTrips: Trip[] = (data || []).map(booking => ({
          id: booking.id,
          provider: booking.provider,
          pickup: booking.pickup_location,
          dropoff: booking.dropoff_location,
          fare: Number(booking.fare),
          date: booking.created_at || '',
          status: booking.status as "completed" | "cancelled",
          rating: booking.rating || undefined,
        }));

        setTrips(formattedTrips);
      } catch (error) {
        console.error('Error fetching trips:', error);
        toast({
          title: "Error",
          description: "Failed to load trip history",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [toast]);

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
          className="mx-auto max-w-4xl"
        >
          <h1 className="mb-8 text-3xl font-bold text-foreground">Trip History</h1>

          {trips.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No trips yet. Start booking rides to see your history here!</p>
            </Card>
          ) : (
            <div className="space-y-4">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden transition-all hover:shadow-lg">
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-foreground">
                            {trip.provider}
                          </h3>
                          <Badge 
                            variant={trip.status === "completed" ? "default" : "secondary"}
                          >
                            {trip.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(trip.date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₹{trip.fare}</p>
                        {trip.rating && (
                          <div className="mt-1 flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium text-foreground">
                              {trip.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-1 h-4 w-4 text-primary" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Pickup</p>
                          <p className="text-sm font-medium text-foreground">{trip.pickup}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Navigation className="mt-1 h-4 w-4 text-destructive" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Drop-off</p>
                          <p className="text-sm font-medium text-foreground">{trip.dropoff}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Receipt
                      </Button>
                      {!trip.rating && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Star className="mr-2 h-4 w-4" />
                          Rate
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default History;

import { useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MapPin, Navigation, User, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

const RideTracking = () => {
  const location = useLocation();
  const { provider, price, pickup, dropoff } = location.state || {};
  const [progress, setProgress] = useState(25);
  const [status, setStatus] = useState("Searching for driver...");

  useEffect(() => {
    const statusUpdates = [
      { delay: 2000, progress: 50, status: "Driver accepted" },
      { delay: 4000, progress: 75, status: "Driver on the way" },
      { delay: 6000, progress: 100, status: "Driver arrived" }
    ];

    statusUpdates.forEach(({ delay, progress, status }) => {
      setTimeout(() => {
        setProgress(progress);
        setStatus(status);
      }, delay);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-foreground">Track Your Ride</h1>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              {provider}
            </Badge>
          </div>

          {/* Map Placeholder */}
          <Card className="mb-6 overflow-hidden">
            <div className="relative h-96 bg-accent">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto mb-4 h-16 w-16 text-accent-foreground" />
                  <p className="text-lg font-medium text-accent-foreground">
                    Map view will appear here
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Showing route from {pickup} to {dropoff}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Ride Status */}
          <Card className="mb-6 p-6">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Ride Status</h2>
                <Badge>{status}</Badge>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-medium text-foreground">{pickup}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Navigation className="h-5 w-5 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Drop-off</p>
                  <p className="font-medium text-foreground">{dropoff}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Driver Details */}
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Driver Details</h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <User className="h-7 w-7 text-accent-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Rajesh Kumar</p>
                  <p className="text-sm text-muted-foreground">KA-01-AB-1234</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-sm font-medium text-foreground">4.8</span>
                    <span className="text-sm text-muted-foreground">★ (250 trips)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <Phone className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-accent p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Fare</span>
                <span className="text-2xl font-bold text-primary">₹{price}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RideTracking;

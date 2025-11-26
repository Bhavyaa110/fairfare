import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { MapPin, Navigation, Car } from "lucide-react";
import Navbar from "@/components/Navbar";
import RideMap from "@/components/RideMap";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Fare {
  provider: string;
  price: number;
  eta: string;
  carType: string;
  color: string;
  logo: string;
}

// Local fallback providers & helpers (mirrors the Edge Function)
const providersFallback = [
  { name: "Uber", base: 45, perKm: 12, perMin: 0, color: "bg-black", logo: "🚕" },
  { name: "Ola", base: 40, perKm: 11, perMin: 0, color: "bg-green-500", logo: "🚗" },
  { name: "Rapido", base: 20, perKm: 9, perMin: 0, color: "bg-yellow-500", logo: "🏍️" },
];

function calculateFareLocal(provider: any, distance: number, duration: number, surge: number) {
  const baseFare = provider.base;
  const distanceFare = distance * provider.perKm;
  return Math.round((baseFare + distanceFare) * surge);
}
function getRandomSurgeLocal() {
  return parseFloat((1 + Math.random() * 0.5).toFixed(2));
}
function getRandomETALocal() {
  return Math.floor(Math.random() * 9) + 2;
}

// small helper to add timeout to function invoke
function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T> {
  const timeout = new Promise<never>((_res, rej) => setTimeout(() => rej(new Error("timeout")), ms));
  return Promise.race([promise, timeout]) as Promise<T>;
}

const Compare = () => {
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [fares, setFares] = useState<Fare[]>([]);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);

  const handleCompare = async () => {
    if (!pickup || !dropoff) {
      toast.error("Please enter both pickup and drop-off locations");
      return;
    }

    if (!pickupCoords || !dropCoords) {
      toast.error("Please select locations on the map");
      return;
    }

    if (distance === 0) {
      toast.error("Distance not calculated yet. Please wait for the route to load.");
      return;
    }

    setLoading(true);

    try {
      // Try calling the Edge Function with a short timeout
      let res: any;
      try {
        res = await withTimeout(
          supabase.functions.invoke("calculate-fare", {
            body: {
              distance: distance,
              duration: duration,
            },
          }),
          6000 // 6s timeout
        );
      } catch (fnErr) {
        console.warn("Edge Function invoke failed or timed out, falling back to local calc:", fnErr);
        throw fnErr;
      }

      // Normalize and parse response
      const funcError = (res as any).error ?? null;
      let payload = (res as any).data ?? null;

      if (funcError) {
        console.error("calculate-fare function error:", funcError);
        throw funcError;
      }

      if (typeof payload === "string") {
        try {
          payload = JSON.parse(payload);
        } catch (parseErr) {
          console.error("Failed to parse calculate-fare response string:", parseErr, payload);
          throw new Error("Invalid response from fare service");
        }
      }

      if (!payload || !payload.fares) {
        console.error("Unexpected calculate-fare payload:", payload);
        throw new Error("Unexpected response from fare service");
      }

      setFares(
        payload.fares.map((fare: any) => ({
          provider: fare.provider,
          price: fare.price,
          eta: `${fare.eta} min`,
          carType: fare.carType,
          color: fare.color,
          logo: fare.logo,
        }))
      );
      toast.success("Fares calculated successfully!");
    } catch (error: any) {
      // If Edge Function failed, compute fares locally as fallback
      console.error("Edge function failed — falling back to local calculation:", error);

      try {
        const surge = getRandomSurgeLocal();
        const localFares = providersFallback.map((p) => ({
          provider: p.name,
          price: calculateFareLocal(p, distance, duration, surge),
          eta: getRandomETALocal(),
          carType: p.name === "Rapido" ? "Bike" : p.name === "Ola" ? "Mini" : "Go",
          color: p.color,
          logo: p.logo,
          distance: Number(distance.toFixed(2)),
          duration: Math.round(duration),
          surge,
        })).sort((a, b) => a.price - b.price);

        setFares(
          localFares.map((fare: any) => ({
            provider: fare.provider,
            price: fare.price,
            eta: `${fare.eta} min`,
            carType: fare.carType,
            color: fare.color,
            logo: fare.logo,
          }))
        );

        toast.success("Fares calculated..");
        console.info("Used local fallback fares due to Edge Function error:", error);
      } catch (localErr) {
        console.error("Local fare calculation also failed:", localErr);
        const message = (localErr?.message) ? localErr.message : String(localErr);
        toast.error(`Failed to calculate fares: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBookRide = (provider: string, price: number) => {
    navigate("/booking", { 
      state: { 
        provider, 
        price, 
        pickup, 
        dropoff,
        pickupCoords,
        dropCoords,
        distance,
        duration
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-10 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
              Compare Cab Fares
            </h1>
            <p className="text-lg text-muted-foreground">
              Find the best deals across Uber, Ola, and Rapido
            </p>
          </div>

          {/* Interactive Map */}
          <Card className="mb-10 overflow-hidden border-0 bg-card shadow-xl">
            <RideMap
              pickup={pickupCoords}
              drop={dropCoords}
              onPickupChange={(coords, address) => {
                setPickupCoords(coords);
                setPickup(address);
              }}
              onDropChange={(coords, address) => {
                setDropCoords(coords);
                setDropoff(address);
              }}
              onRouteCalculated={(dist, dur) => {
                setDistance(dist);
                setDuration(dur);
              }}
              enableSelection={true}
            />
          </Card>

          {/* Distance Display */}
          {distance > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="border-primary/20 bg-primary/5 shadow-md">
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Calculated Distance</p>
                  <p className="text-2xl font-bold text-primary">{distance.toFixed(2)} km</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Estimated time: {Math.round(duration)} minutes
                  </p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Location Input */}
          <Card className="mb-10 overflow-hidden border-0 bg-card shadow-xl">
            <div className="bg-gradient-accent p-8">
              <div className="space-y-6">
                <div className="group">
                  <Label htmlFor="pickup" className="mb-3 flex items-center gap-2 text-base font-semibold">
                    <div className="rounded-full bg-primary/10 p-1.5">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    Pickup Location
                  </Label>
                  <Input
                    id="pickup"
                    placeholder="Enter your pickup location"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="h-12 border-2 text-base transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="group">
                  <Label htmlFor="dropoff" className="mb-3 flex items-center gap-2 text-base font-semibold">
                    <div className="rounded-full bg-destructive/10 p-1.5">
                      <Navigation className="h-5 w-5 text-destructive" />
                    </div>
                    Drop-off Location
                  </Label>
                  <Input
                    id="dropoff"
                    placeholder="Enter your destination"
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    className="h-12 border-2 text-base transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <Button 
                  onClick={handleCompare} 
                  className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={loading}
                >
                  {loading ? (
                    <><Car className="mr-2 h-5 w-5 animate-bounce" /> Finding Best Fares...</>
                  ) : (
                    "Compare Fares"
                  )}
                </Button>
              </div>
            </div>
          </Card>

          {/* Fare Comparison Results */}
          {fares.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Available Rides
                </h2>
                <div className="rounded-full bg-success/10 px-4 py-1.5 text-sm font-semibold text-success">
                  {fares.length} options found
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {fares.map((fare, index) => (
                  <motion.div
                    key={fare.provider}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`group relative h-full overflow-hidden border-2 transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 ${
                      index === 0 ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'
                    }`}>
                      {index === 0 && (
                        <div className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-br from-success to-success-foreground px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                          BEST DEAL
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-14 w-14 items-center justify-center rounded-xl text-3xl shadow-md ${fare.color}`}>
                              {fare.logo}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-foreground">
                                {fare.provider}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {fare.carType}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6 space-y-3 rounded-lg bg-accent/50 p-4">
                          <div className="flex items-baseline justify-between">
                            <span className="text-sm text-muted-foreground">Fare</span>
                            <div className="text-right">
                              <span className="text-3xl font-bold text-primary">
                                ₹{fare.price}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between border-t border-border pt-2">
                            <span className="text-sm text-muted-foreground">ETA</span>
                            <span className="font-semibold text-foreground">{fare.eta}</span>
                          </div>
                        </div>

                        <Button 
                          onClick={() => handleBookRide(fare.provider, fare.price)}
                          className="w-full h-12 font-semibold shadow-md transition-all duration-300 hover:shadow-lg"
                          variant={index === 0 ? "default" : "outline"}
                        >
                          Book Now
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Compare;

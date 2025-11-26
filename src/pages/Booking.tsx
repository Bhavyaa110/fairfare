import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { MapPin, Navigation, CreditCard, Smartphone, Building2, Wallet, Banknote, Car } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const paymentMethods = [
  {
    id: "upi",
    name: "UPI",
    description: "Google Pay, PhonePe, Paytm",
    icon: Smartphone,
  },
  {
    id: "card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Rupay",
    icon: CreditCard,
  },
  {
    id: "netbanking",
    name: "Net Banking",
    description: "All major banks",
    icon: Building2,
  },
  {
    id: "wallet",
    name: "Wallet",
    description: "Paytm, PhonePe, Amazon Pay",
    icon: Wallet,
  },
  {
    id: "cash",
    name: "Cash",
    description: "Pay driver directly",
    icon: Banknote,
  },
];

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { provider, price, pickup, dropoff } = location.state || {};
  const [selectedPayment, setSelectedPayment] = useState("upi");

  if (!provider) {
    navigate("/compare");
    return null;
  }

  const handleConfirmBooking = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to book a ride');
        navigate('/auth');
        return;
      }
      
      const bookingRow = {
        user_id: user.id,
        provider,
        pickup_location: pickup,
        dropoff_location: dropoff,
        fare: price,
        // store chosen method separately; keep status as a valid enum value
        payment_method: selectedPayment,
        payment_status: 'pending',
        status: 'pending'
      };

      // Use array form and request the inserted row back for clearer errors/data
      const { data: inserted, error } = await supabase
        .from('bookings')
        .insert([bookingRow])
        .select()
        .single();

      if (error) {
        console.error('Booking insert error:', error);
        const msg = error.message ?? 'Failed to create booking. Please try again.';
        // Common helpful hint for permission/RLS issues:
        if ((msg || '').toLowerCase().includes('permission') || (msg || '').toLowerCase().includes('not authorized') || (msg || '').toLowerCase().includes('row-level')) {
          toast.error('Booking failed: permission denied. Ensure you are logged in and your database policies allow creating bookings.');
        } else if (error.details) {
          toast.error(`${msg} — ${error.details}`);
        } else {
          toast.error(msg);
        }
        return;
      }
      
      const selectedMethod = paymentMethods.find(m => m.id === selectedPayment);
      toast.success(`Booking confirmed with ${selectedMethod?.name}! Searching for driver...`);
      setTimeout(() => {
        navigate("/ride-tracking", { 
          state: { provider, price, pickup, dropoff } 
        });
      }, 1500);
    } catch (error) {
      console.error('Booking error (unexpected):', error);
      const message = (error as any)?.message ?? String(error);
      toast.error(message || 'Failed to create booking. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-2xl"
        >
          <div className="mb-10 text-center">
            <h1 className="mb-2 bg-gradient-to-r from-primary to-primary-light bg-clip-text text-4xl font-bold text-transparent">
              Confirm Your Booking
            </h1>
            <p className="text-muted-foreground">Review your trip details before booking</p>
          </div>

          <Card className="mb-6 overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-accent p-8">
              <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Trip Details
              </h2>
              
              <div className="space-y-5">
                <div className="flex items-start gap-4 rounded-lg bg-card p-4 shadow-sm">
                  <div className="rounded-full bg-primary/10 p-2">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">Pickup Location</p>
                    <p className="text-lg font-semibold text-foreground">{pickup}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-lg bg-card p-4 shadow-sm">
                  <div className="rounded-full bg-destructive/10 p-2">
                    <Navigation className="h-6 w-6 text-destructive" />
                  </div>
                  <div className="flex-1">
                    <p className="mb-1 text-sm font-medium text-muted-foreground">Drop-off Location</p>
                    <p className="text-lg font-semibold text-foreground">{dropoff}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-card p-8">
              <h2 className="mb-6 text-2xl font-semibold text-foreground">
                Ride Details
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-accent/30 p-4">
                  <span className="text-base text-muted-foreground">Provider</span>
                  <span className="text-xl font-bold text-foreground">{provider}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-gradient-primary p-6 shadow-lg">
                  <span className="text-lg font-medium text-primary-foreground">Total Fare</span>
                  <span className="text-4xl font-bold text-primary-foreground">₹{price}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="mb-6 p-6">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-foreground">
              <CreditCard className="h-5 w-5" />
              Payment Method
            </h2>
            
            <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedPayment === method.id;
                  
                  return (
                    <Label
                      key={method.id}
                      htmlFor={method.id}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all hover:bg-accent/50 ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          isSelected ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                        }`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground">
                            {method.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {method.description}
                          </span>
                        </div>
                      </div>
                      <RadioGroupItem value={method.id} id={method.id} />
                    </Label>
                  );
                })}
              </div>
            </RadioGroup>
          </Card>

          <Button 
            onClick={handleConfirmBooking}
            className="w-full h-16 text-xl font-bold shadow-2xl hover:shadow-primary transition-all duration-300"
            size="lg"
          >
            <Car className="mr-2 h-6 w-6" />
            Confirm Booking
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Booking;

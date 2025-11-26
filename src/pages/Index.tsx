import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Car, TrendingDown, Shield, Clock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate("/compare");
    } else {
      navigate("/auth");
    }
  };
  const features = [
    {
      icon: TrendingDown,
      title: "Best Prices",
      description: "Compare fares from Uber, Ola, and Rapido in real-time to get the best deal"
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and encrypted payment processing for all your rides"
    },
    {
      icon: Clock,
      title: "Track Rides",
      description: "Real-time tracking and live updates on your ride status"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-24 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6 inline-block rounded-full bg-primary-foreground/10 px-6 py-2 backdrop-blur-sm"
            >
              <span className="text-sm font-semibold text-primary-foreground">
                🚀 India's #1 Cab Fare Comparison App
              </span>
            </motion.div>
            
            <h1 className="mb-6 text-5xl font-bold leading-tight text-primary-foreground md:text-7xl">
              Compare. Book. Save.
            </h1>
            <p className="mb-10 text-lg text-primary-foreground/90 md:text-2xl">
              Find the best cab fares from Uber, Ola, and Rapido - all in one place
            </p>
            <Button 
              size="lg" 
              variant="secondary" 
              className="group relative overflow-hidden text-lg px-10 py-7 shadow-2xl hover:shadow-primary transition-all duration-300"
              onClick={handleGetStarted}
            >
              <span className="relative z-10">
                {user ? "Compare Fares Now" : "Get Started"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </motion.div>
        </div>
        
        {/* Enhanced Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl animate-pulse" />
          <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-primary-foreground/10 blur-3xl animate-pulse" />
          <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground/5 blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              Why Choose RideCompare?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Experience the future of cab booking with our intelligent comparison platform
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-8 md:grid-cols-3"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="group relative h-full overflow-hidden border-0 bg-gradient-card p-8 shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
                  <div className="absolute inset-0 bg-gradient-accent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="relative z-10">
                    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gradient-to-br from-accent/30 via-background to-accent/30 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Get the best cab fare in just three simple steps
            </p>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Enter Route",
                description: "Simply enter your pickup and drop-off locations"
              },
              {
                step: "02",
                title: "Compare Fares",
                description: "View real-time prices from multiple cab services"
              },
              {
                step: "03",
                title: "Book & Save",
                description: "Choose the best option and save on every ride"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <Card className="group relative h-full overflow-hidden border-2 border-primary/10 bg-card p-8 text-center shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10">
                  <div className="absolute -top-6 right-4 text-8xl font-bold text-primary/5 transition-all duration-300 group-hover:text-primary/10">
                    {item.step}
                  </div>
                  <div className="relative z-10">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg">
                      {item.step}
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20">
        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 text-4xl font-bold text-primary-foreground md:text-5xl">
              Ready to save on your next ride?
            </h2>
            <p className="mb-8 text-xl text-primary-foreground/90">
              Join thousands of smart travelers who compare before they book
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="px-10 py-7 text-lg font-semibold shadow-2xl hover:shadow-primary transition-all duration-300"
              onClick={handleGetStarted}
            >
              {user ? "Start Comparing Now" : "Get Started Free"}
            </Button>
          </motion.div>
        </div>
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary-foreground/10 blur-3xl animate-pulse" />
          <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-primary-foreground/10 blur-3xl animate-pulse" />
        </div>
      </section>
    </div>
  );
};

export default Index;

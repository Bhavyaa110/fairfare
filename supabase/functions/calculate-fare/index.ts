import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsBase = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const fareRequestSchema = z.object({
  distance: z.number()
    .positive({ message: "Distance must be positive" })
    .max(500, { message: "Distance too large (max 500 km)" })
    .finite({ message: "Distance must be finite" }),
  duration: z.number()
    .positive({ message: "Duration must be positive" })
    .max(1440, { message: "Duration too large (max 24 hours)" })
    .finite({ message: "Duration must be finite" })
});

interface Provider {
  name: string;
  base: number;
  perKm: number;
  perMin: number;
  color: string;
  logo: string;
}

const providers: Provider[] = [
  { name: "Uber", base: 45, perKm: 12, perMin: 0, color: "bg-black", logo: "🚕" },
  { name: "Ola", base: 40, perKm: 11, perMin: 0, color: "bg-green-500", logo: "🚗" },
  { name: "Rapido", base: 20, perKm: 9, perMin: 0, color: "bg-yellow-500", logo: "🏍️" },
];

function calculateFare(provider: Provider, distance: number, duration: number, surge: number) {
  const baseFare = provider.base;
  const distanceFare = distance * provider.perKm;
  const totalFare = (baseFare + distanceFare) * surge;
  return Math.round(totalFare);
}

function getRandomSurge() {
  // Random surge between 1.0 and 1.5 for realistic pricing
  return parseFloat((1 + Math.random() * 0.5).toFixed(2));
}

function getRandomETA() {
  // Random ETA between 2 and 10 minutes
  return Math.floor(Math.random() * 9) + 2;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsBase });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsBase, "Content-Type": "application/json" },
    });
  }

  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch (err) {
      console.error("Failed to parse JSON body:", err);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsBase, "Content-Type": "application/json" },
      });
    }

    // Validate input with zod
    const validationResult = fareRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || "Invalid input";
      console.error("Validation error:", validationResult.error.errors);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { ...corsBase, "Content-Type": "application/json" },
      });
    }

    const { distance, duration } = validationResult.data;
    const surge = getRandomSurge();

    const fares = providers.map((provider) => ({
      provider: provider.name,
      price: calculateFare(provider, distance, duration, surge),
      eta: getRandomETA(),
      carType: provider.name === "Rapido" ? "Bike" : provider.name === "Ola" ? "Mini" : "Go",
      color: provider.color,
      logo: provider.logo,
      distance: Number(distance.toFixed(2)),
      duration: Math.round(duration),
      surge,
    }));

    // Sort by price ascending
    fares.sort((a, b) => a.price - b.price);

    return new Response(JSON.stringify({ fares }), {
      status: 200,
      headers: { ...corsBase, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error calculating fares:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsBase, "Content-Type": "application/json" },
    });
  }
});

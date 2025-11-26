import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsBase = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const geocodeRequestSchema = z.object({
  lat: z.number()
    .min(-90, { message: "Latitude must be >= -90" })
    .max(90, { message: "Latitude must be <= 90" })
    .finite({ message: "Latitude must be finite" }),
  lng: z.number()
    .min(-180, { message: "Longitude must be >= -180" })
    .max(180, { message: "Longitude must be <= 180" })
    .finite({ message: "Longitude must be finite" })
});

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsBase });
  }

  // Only accept POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed, use POST" }), {
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

    // Validate input
    const validationResult = geocodeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || "Invalid coordinates";
      console.error("Validation error:", validationResult.error.errors);
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { ...corsBase, "Content-Type": "application/json" },
      });
    }

    const { lat, lng } = validationResult.data;

    console.log(`Geocoding request: lat=${lat}, lng=${lng}`);

    // Proxy the request to Nominatim with proper headers
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`,
      {
        headers: {
          "User-Agent": "FairFare-App/1.0 (+https://your-domain.example)",
          "Accept-Language": "en",
        },
        // set a reasonable timeout if running in an environment that supports AbortController (optional)
      }
    );

    if (!response.ok) {
      console.error(`Nominatim error: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({
          error: "Geocoding service unavailable",
          display_name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        }),
        {
          status: response.status,
          headers: { ...corsBase, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();

    // Return only the useful parts to the client
    const result = {
      display_name: data.display_name ?? null,
      lat: Number(data.lat ?? lat),
      lon: Number(data.lon ?? lng),
      address: data.address ?? null,
      raw: data,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsBase, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in geocoding:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsBase, "Content-Type": "application/json" },
    });
  }
});

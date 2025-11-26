import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { supabase } from "@/integrations/supabase/client";

interface LatLng {
  lat: number;
  lng: number;
}

interface MapClickHandlerProps {
  onPickupChange?: (location: LatLng, address: string) => void;
  onDropChange?: (location: LatLng, address: string) => void;
  pickup: LatLng | null;
  drop: LatLng | null;
  enableSelection?: boolean;
}

export default function MapClickHandler({ 
  onPickupChange, 
  onDropChange, 
  pickup, 
  drop,
  enableSelection 
}: MapClickHandlerProps) {
  const map = useMap();

  useEffect(() => {
    if (!enableSelection) return;

    const handleClick = async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Reverse geocoding via proxy edge function for privacy
      try {
        const { data, error } = await supabase.functions.invoke('geocode', {
          body: { lat, lng }
        });
        
        if (error) throw error;
        
        const address = data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

        if (!pickup && onPickupChange) {
          onPickupChange({ lat, lng }, address);
        } else if (!drop && onDropChange) {
          onDropChange({ lat, lng }, address);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
        const address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        if (!pickup && onPickupChange) {
          onPickupChange({ lat, lng }, address);
        } else if (!drop && onDropChange) {
          onDropChange({ lat, lng }, address);
        }
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, pickup, drop, onPickupChange, onDropChange, enableSelection]);

  return null;
}

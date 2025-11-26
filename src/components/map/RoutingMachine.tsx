import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

interface LatLng {
  lat: number;
  lng: number;
}

interface RoutingMachineProps {
  pickup: LatLng | null;
  drop: LatLng | null;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

export default function RoutingMachine({ 
  pickup, 
  drop, 
  onRouteCalculated 
}: RoutingMachineProps) {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);

  useEffect(() => {
    if (!pickup || !drop) {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
      return;
    }

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickup.lat, pickup.lng),
        L.latLng(drop.lat, drop.lng),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      router: L.Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
      }),
      lineOptions: {
        styles: [{ color: "hsl(var(--primary))", opacity: 0.8, weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0,
      },
      show: false,
      fitSelectedRoutes: true,
    }).addTo(map);

    routingControl.on("routesfound", (e) => {
      const routes = e.routes;
      const route = routes[0];
      const distanceInKm = route.summary.totalDistance / 1000;
      const durationInMin = route.summary.totalTime / 60;
      
      if (onRouteCalculated) {
        onRouteCalculated(distanceInKm, durationInMin);
      }
    });

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
        routingControlRef.current = null;
      }
    };
  }, [pickup, drop, map, onRouteCalculated]);

  return null;
}

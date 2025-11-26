import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import RoutingMachine from "@/components/map/RoutingMachine";
import MapClickHandler from "@/components/map/MapClickHandler";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom icons
const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const dropIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface LatLng {
  lat: number;
  lng: number;
}

interface RideMapProps {
  pickup: LatLng | null;
  drop: LatLng | null;
  onPickupChange?: (location: LatLng, address: string) => void;
  onDropChange?: (location: LatLng, address: string) => void;
  onRouteCalculated?: (distance: number, duration: number) => void;
  driverPosition?: LatLng | null;
  enableSelection?: boolean;
}

export default function RideMap({ 
  pickup, 
  drop, 
  onPickupChange, 
  onDropChange, 
  onRouteCalculated,
  driverPosition,
  enableSelection = true 
}: RideMapProps) {
  const [center, setCenter] = useState<LatLng>({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(location);
          setCenter(location);
        },
        (error) => {
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-border shadow-elegant">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && !pickup && !drop && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>Your current location</Popup>
          </Marker>
        )}

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup>Pickup Location</Popup>
          </Marker>
        )}

        {drop && (
          <Marker position={[drop.lat, drop.lng]} icon={dropIcon}>
            <Popup>Drop Location</Popup>
          </Marker>
        )}

        {driverPosition && (
          <Marker position={[driverPosition.lat, driverPosition.lng]} icon={driverIcon}>
            <Popup>Driver Location</Popup>
          </Marker>
        )}

        <MapClickHandler 
          onPickupChange={onPickupChange}
          onDropChange={onDropChange}
          pickup={pickup}
          drop={drop}
          enableSelection={enableSelection}
        />

        {pickup && drop && (
          <RoutingMachine 
            pickup={pickup} 
            drop={drop} 
            onRouteCalculated={onRouteCalculated}
          />
        )}
      </MapContainer>
    </div>
  );
}

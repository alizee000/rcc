"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapProps {
  venues: any[];
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function MapComponent({ venues }: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ height: "100%", width: "100%", backgroundColor: "var(--bg-secondary)" }} />;

  const center: [number, number] = venues.length > 0 
    ? [venues[0].lat, venues[0].lng] 
    : [20.5937, 78.9629]; // Default to India center

  return (
    <MapContainer 
      center={center} 
      zoom={10} 
      scrollWheelZoom={true} 
      style={{ height: "100%", width: "100%", zIndex: 1 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={center} zoom={10} />
      
      {venues.map(venue => (
        <Marker key={venue.id} position={[venue.lat, venue.lng]} icon={customIcon}>
          <Popup>
            <div style={{ color: "#333", fontWeight: "bold" }}>{venue.name}</div>
            <div style={{ color: "#666" }}>{venue.city}</div>
            {venue.experiences?.length > 0 && (
              <div style={{ color: "#00E676", fontWeight: "bold", marginTop: 4 }}>
                From ₹{Math.min(...venue.experiences.map((e: any) => e.price))}
              </div>
            )}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

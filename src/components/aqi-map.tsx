"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

type AqiMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  aqi: number | null;
};

const getAqiColorClass = (aqi: number | null) => {
    if (aqi === null) return "bg-gray-400";
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    if (aqi <= 200) return "bg-red-500";
    if (aqi <= 300) return "bg-purple-500";
    return "bg-rose-700";
};

export default function AqiMap({ center, zoom, aqi }: AqiMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground text-center p-4">
          Google Maps API key is missing. Please create one and add it to your .env file as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
        </p>
      </div>
    );
  }
  
  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="breathe-easy-map"
        style={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
      >
        {aqi !== null && (
          <AdvancedMarker position={center}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg ${getAqiColorClass(aqi)}`}>
              {aqi}
            </div>
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
}

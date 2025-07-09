"use client";

import { useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { School, UserCircle } from "lucide-react";
import type { FindNearbySchoolsOutput } from "@/ai/flows/find-nearby-schools";
import { cn } from "@/lib/utils";

type SchoolData = FindNearbySchoolsOutput['schools'][0];

type SchoolZoneMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  schools: SchoolData[];
  selectedSchool: SchoolData | null;
  onMarkerClick: (school: SchoolData) => void;
  userLocation: { lat: number; lng: number };
};

const getAqiColorClass = (aqi: number) => {
    if (aqi <= 50) return "text-green-500 fill-green-100";
    if (aqi <= 100) return "text-yellow-500 fill-yellow-100";
    if (aqi <= 150) return "text-orange-500 fill-orange-100";
    if (aqi <= 200) return "text-red-500 fill-red-100";
    if (aqi <= 300) return "text-purple-700 fill-purple-200";
    return "text-rose-700 fill-rose-200";
};

// This component will control the map's center and zoom imperatively
const MapController = ({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            map.panTo(center);
            map.setZoom(zoom);
        }
    }, [map, center, zoom]);
    return null;
};

export default function SchoolZoneMap({ center, zoom, schools, selectedSchool, onMarkerClick, userLocation }: SchoolZoneMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === "YOUR_GOOGLE_MAPS_API_KEY_HERE") {
    return (
      <div className="flex items-center justify-center h-full bg-muted">
        <p className="text-muted-foreground text-center p-4">
          Google Maps API key is missing. Please add it to your .env file.
        </p>
      </div>
    );
  }
  
  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="breathe-easy-school-map"
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
      >
        <MapController center={center} zoom={zoom} />
        
        <AdvancedMarker position={userLocation} title="Your Location">
            <UserCircle className="w-8 h-8 text-blue-600 fill-blue-200" />
        </AdvancedMarker>

        {schools.map((school) => (
          <AdvancedMarker
            key={school.name}
            position={{ lat: school.lat, lng: school.lon }}
            title={`${school.name}\nAQI: ${school.aqi}`}
            onClick={() => onMarkerClick(school)}
          >
            <div className={cn(
                "transition-transform",
                selectedSchool?.name === school.name && "transform scale-125"
            )}>
              <School className={cn("w-8 h-8", getAqiColorClass(school.aqi))} />
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

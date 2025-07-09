"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Hospital, UserCircle } from "lucide-react";
import type { FindNearbyHospitalsOutput } from "@/ai/flows/find-nearby-hospitals";
import { cn } from "@/lib/utils";

type HospitalData = FindNearbyHospitalsOutput['hospitals'][0];

type EmergencyMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  hospitals: HospitalData[];
  selectedHospital: HospitalData | null;
  onMarkerClick: (hospital: HospitalData) => void;
  userLocation: { lat: number; lng: number };
};

export default function EmergencyMap({ center, zoom, hospitals, selectedHospital, onMarkerClick, userLocation }: EmergencyMapProps) {
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
        mapId="breathe-easy-emergency-map"
        style={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        key={`${center.lat}-${center.lng}-${zoom}`} // Force re-render on center/zoom change
      >
        <AdvancedMarker position={userLocation} title="Your Location">
            <UserCircle className="w-8 h-8 text-blue-600 fill-blue-200" />
        </AdvancedMarker>

        {hospitals.map((hospital) => (
          <AdvancedMarker
            key={hospital.name}
            position={{ lat: hospital.lat, lng: hospital.lon }}
            title={`${hospital.name}\n${hospital.address}`}
            onClick={() => onMarkerClick(hospital)}
          >
            <div className={cn(
              "w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg transition-transform",
              selectedHospital?.name === hospital.name && "transform scale-125 bg-red-700 ring-2 ring-white"
            )}>
              <Hospital className="w-5 h-5" />
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}

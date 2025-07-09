"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Hospital, UserCircle } from "lucide-react";
import type { FindNearbyHospitalsOutput } from "@/ai/flows/find-nearby-hospitals";

type HospitalData = FindNearbyHospitalsOutput['hospitals'][0];

type EmergencyMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  hospitals: HospitalData[];
};

export default function EmergencyMap({ center, zoom, hospitals }: EmergencyMapProps) {
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
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
      >
        <AdvancedMarker position={center} title="Your Location">
            <UserCircle className="w-8 h-8 text-blue-600 fill-blue-200" />
        </AdvancedMarker>

        {hospitals.map((hospital) => (
          <AdvancedMarker
            key={hospital.name}
            position={{ lat: hospital.lat, lng: hospital.lon }}
            title={`${hospital.name}\n${hospital.address}`}
          >
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
              <Hospital className="w-5 h-5" />
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
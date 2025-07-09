"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

type PollutionSourceMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  showVehicleDensity: boolean;
  showIndustrialZones: boolean;
};

type HeatmapPoint = {
  lat: number;
  lng: number;
  weight: number;
  type: 'traffic' | 'industrial';
};

// Mock data for heatmap representing pollution hotspots
const heatmapData: HeatmapPoint[] = [
  // Traffic Hotspots
  { lat: 28.63, lng: 77.22, weight: 0.8, type: 'traffic' }, // Connaught Place
  { lat: 28.6562, lng: 77.2410, weight: 0.6, type: 'traffic' }, // Red Fort Area
  { lat: 28.644, lng: 77.152, weight: 0.5, type: 'traffic' }, // Karol Bagh (Commercial)
  { lat: 28.55, lng: 77.25, weight: 0.8, type: 'traffic' }, // Nehru Place (Commercial)
  { lat: 28.61, lng: 77.37, weight: 0.7, type: 'traffic' }, // Anand Vihar (High Traffic/Interstate Bus Terminal)
  { lat: 28.58, lng: 77.05, weight: 0.5, type: 'traffic' }, // Airport Area (Air Traffic)

  // Industrial Hotspots
  { lat: 28.7041, lng: 77.1025, weight: 1.0, type: 'industrial' }, // Wazirpur Industrial Area
  { lat: 28.5273, lng: 77.2838, weight: 0.9, type: 'industrial' }, // Okhla Industrial Estate
  { lat: 28.4978, lng: 77.0805, weight: 0.7, type: 'industrial' }, // Udyog Vihar, Gurgaon
  { lat: 28.776, lng: 77.068, weight: 0.9, type: 'industrial' }, // Narela Industrial Complex
];

const HeatmapLayer = ({ showVehicleDensity, showIndustrialZones }: { showVehicleDensity: boolean; showIndustrialZones: boolean }) => {
  const map = useMap();
  const [heatmap, setHeatmap] = useState<google.maps.visualization.HeatmapLayer | null>(null);

  // Effect for creating and destroying the heatmap instance
  useEffect(() => {
    if (!map) return;

    let heatmapInstance: google.maps.visualization.HeatmapLayer;

    // Asynchronously load the visualization library and create the heatmap
    const initHeatmap = async () => {
        const { HeatmapLayer } = (await google.maps.importLibrary(
            "visualization"
        )) as google.maps.visualization.VisualizationLibrary;

        heatmapInstance = new HeatmapLayer({ map });
        // Increase the radius for a larger heatmap effect
        heatmapInstance.set("radius", 50);
        // Adjust opacity to make the underlying map more visible
        heatmapInstance.set("opacity", 0.7);
        // Set a custom color gradient from cool to hot
        heatmapInstance.set("gradient", [
            "rgba(0, 255, 255, 0)",
            "rgba(0, 255, 255, 1)",
            "rgba(0, 127, 255, 1)",
            "rgba(255, 255, 0, 1)",
            "rgba(255, 140, 0, 1)",
            "rgba(255, 0, 0, 1)",
        ]);
        setHeatmap(heatmapInstance);
    };
    
    initHeatmap();

    // Cleanup function to remove the heatmap from the map when the component unmounts
    return () => {
      if (heatmapInstance) {
        heatmapInstance.setMap(null);
      }
    };
  }, [map]);

  // Effect for updating the heatmap data based on props
  useEffect(() => {
    if (!heatmap) return;

    const filteredData = heatmapData.filter(p => {
      if (p.type === 'traffic' && showVehicleDensity) return true;
      if (p.type === 'industrial' && showIndustrialZones) return true;
      return false;
    });

    const weightedPoints = filteredData.map((p) => ({
      location: new google.maps.LatLng(p.lat, p.lng),
      weight: p.weight,
    }));
    
    heatmap.setData(weightedPoints);

  }, [heatmap, showVehicleDensity, showIndustrialZones]);

  return null;
};

export default function PollutionSourceMap({ center, zoom, showVehicleDensity, showIndustrialZones }: PollutionSourceMapProps) {
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
        mapId="pollution-source-map"
        style={{ width: '100%', height: '100%' }}
        center={center}
        zoom={zoom}
        gestureHandling={'greedy'}
        disableDefaultUI={false}
        mapTypeId={'satellite'}
      >
        <HeatmapLayer showVehicleDensity={showVehicleDensity} showIndustrialZones={showIndustrialZones}/>
      </Map>
    </APIProvider>
  );
}

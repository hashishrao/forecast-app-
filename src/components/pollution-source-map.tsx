"use client";

import { useEffect, useState } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import type { GenerateHeatmapDataOutput } from "@/ai/flows/generate-heatmap-data";

type HeatmapPoint = GenerateHeatmapDataOutput['points'][0];

type PollutionSourceMapProps = {
  center: { lat: number; lng: number };
  zoom: number;
  points: HeatmapPoint[];
  showVehicleDensity: boolean;
  showIndustrialZones: boolean;
};

const HeatmapLayer = ({ points, showVehicleDensity, showIndustrialZones }: { points: HeatmapPoint[], showVehicleDensity: boolean; showIndustrialZones: boolean }) => {
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

    if (points.length === 0) {
      heatmap.setData([]);
      return;
    }

    const filteredData = points.filter(p => {
      if (p.type === 'traffic' && showVehicleDensity) return true;
      if (p.type === 'industrial' && showIndustrialZones) return true;
      return false;
    });

    const weightedPoints = filteredData.map((p) => ({
      location: new google.maps.LatLng(p.lat, p.lng),
      weight: p.weight,
    }));
    
    heatmap.setData(weightedPoints);

  }, [heatmap, points, showVehicleDensity, showIndustrialZones]);

  return null;
};

export default function PollutionSourceMap({ center, zoom, points, showVehicleDensity, showIndustrialZones }: PollutionSourceMapProps) {
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
        <HeatmapLayer points={points} showVehicleDensity={showVehicleDensity} showIndustrialZones={showIndustrialZones}/>
      </Map>
    </APIProvider>
  );
}

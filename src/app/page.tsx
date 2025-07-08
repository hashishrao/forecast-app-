"use client";

import { useState } from "react";
import AqiDashboard from "@/components/aqi-dashboard";
import HealthRecommendations from "@/components/health-recommendations";
import HistoricalTrends from "@/components/historical-trends";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForecastAqiOutput } from "@/ai/flows/forecast-aqi";
import AqiMap from "@/components/aqi-map";
import PollutionSourceMap from "@/components/pollution-source-map";

type MapData = {
  center: { lat: number; lng: number };
  aqi: number | null;
}

export default function Home() {
  const [mapData, setMapData] = useState<MapData>({
    center: { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
    aqi: null,
  });

  const handleForecastUpdate = (data: ForecastAqiOutput) => {
    setMapData({
      center: { lat: data.lat, lng: data.lon },
      aqi: data.current.aqi,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          
          <div className="xl:col-span-2 space-y-6">
            <AqiDashboard onForecastUpdate={handleForecastUpdate} />
            <HistoricalTrends />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AQI Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                  <AqiMap center={mapData.center} zoom={10} aqi={mapData.aqi} />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Pollution Source Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                  <PollutionSourceMap center={mapData.center} zoom={10} />
                </div>
              </CardContent>
            </Card>
            <HealthRecommendations />
          </div>

        </div>
      </main>
    </div>
  );
}

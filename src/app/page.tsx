"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import AqiDashboard from "@/components/aqi-dashboard";
import ChatAssistant from "@/components/chat-assistant";
import HistoricalTrends from "@/components/historical-trends";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForecastAqiOutput } from "@/ai/flows/forecast-aqi";
import AqiMap from "@/components/aqi-map";
import PollutionSourceMap from "@/components/pollution-source-map";
import { getAqiForecastAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import VoiceAssistant, { type VoiceAssistantHandle } from "@/components/voice-assistant";
import WorldAqiView from "@/components/world-aqi-view";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Car, Warehouse } from "lucide-react";


type MapData = {
  center: { lat: number; lng: number };
  aqi: number | null;
}

const getAqiDescription = (aqi: number) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

export default function Home() {
  const [mapData, setMapData] = useState<MapData>({
    center: { lat: 28.6139, lng: 77.2090 }, // Default to New Delhi
    aqi: null,
  });
  
  const [isPending, startTransition] = useTransition();
  const [forecast, setForecast] = useState<string | null>(null);
  const [aqiData, setAqiData] = useState<ForecastAqiOutput['current'] | null>(null);
  const [currentLocation, setCurrentLocation] = useState("New Delhi");
  const [showVehicleDensity, setShowVehicleDensity] = useState(true);
  const [showIndustrialZones, setShowIndustrialZones] = useState(true);
  const { toast } = useToast();
  const voiceAssistantRef = useRef<VoiceAssistantHandle>(null);

  const handleForecastUpdate = (data: ForecastAqiOutput) => {
    setMapData({
      center: { lat: data.lat, lng: data.lon },
      aqi: data.current.aqi,
    });
  };

  const handleSearch = (location: string) => {
    if (!location || isPending) return;

    setForecast(null);
    setAqiData(null);
    setCurrentLocation(location);

    startTransition(async () => {
      const result = await getAqiForecastAction({ location });
      if (result.success && result.data) {
        setForecast(result.data.forecast);
        setAqiData(result.data.current);
        handleForecastUpdate(result.data);

        const { aqi, temp } = result.data.current;
        const aqiDesc = getAqiDescription(aqi);
        const summary = `The current AQI in ${location} is ${aqi}, which is ${aqiDesc}. The temperature is ${temp} degrees Celsius.`;
        voiceAssistantRef.current?.speak(summary);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to fetch AQI data.",
        });
        voiceAssistantRef.current?.speak(`Sorry, I couldn't get the air quality for ${location}. Please try again.`);
      }
    });
  };

  useEffect(() => {
    handleSearch("New Delhi");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <CardTitle className="p-4">Map Layers</CardTitle>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex items-center justify-between p-2">
                <Label
                  htmlFor="vehicle-density"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Car className="h-5 w-5" />
                  Vehicle Density
                </Label>
                <Switch
                  id="vehicle-density"
                  checked={showVehicleDensity}
                  onCheckedChange={setShowVehicleDensity}
                />
              </div>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex items-center justify-between p-2">
                <Label
                  htmlFor="industrial-zones"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Warehouse className="h-5 w-5" />
                  Industrial Zones
                </Label>
                <Switch
                  id="industrial-zones"
                  checked={showIndustrialZones}
                  onCheckedChange={setShowIndustrialZones}
                />
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col min-h-screen bg-background">
          <Header />
          <main className="flex-1 p-4 sm:p-6 md:p-8">
            <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              <div className="xl:col-span-2 space-y-6">
                <AqiDashboard
                  onSearch={handleSearch}
                  isPending={isPending}
                  forecast={forecast}
                  aqiData={aqiData}
                  initialLocation={currentLocation}
                />
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
                <ChatAssistant />
                <WorldAqiView />
                <Card>
                  <CardHeader>
                    <CardTitle>Pollution Source Heatmap</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                      <PollutionSourceMap
                        center={mapData.center}
                        zoom={10}
                        showVehicleDensity={showVehicleDensity}
                        showIndustrialZones={showIndustrialZones}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
          <VoiceAssistant ref={voiceAssistantRef} onCommand={handleSearch} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

import AqiDashboard from "@/components/aqi-dashboard";
import HealthRecommendations from "@/components/health-recommendations";
import HistoricalTrends from "@/components/historical-trends";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
          
          <div className="xl:col-span-2 space-y-6">
            <AqiDashboard />
            <HistoricalTrends />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AQI Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                  <Image
                    src="https://placehold.co/600x400"
                    alt="Map placeholder"
                    width={600}
                    height={400}
                    className="w-full h-full object-cover"
                    data-ai-hint="world map"
                  />
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

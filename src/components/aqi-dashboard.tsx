"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Thermometer, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "./ui/skeleton";
import type { ForecastAqiOutput } from "@/ai/flows/forecast-aqi";
import BulletGraph from "./bullet-graph";

const formSchema = z.object({
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
});

type AqiDashboardProps = {
  onSearch: (location: string) => void;
  isPending: boolean;
  forecast: string | null;
  aqiData: ForecastAqiOutput['current'] | null;
  initialLocation: string;
};

// Define ranges for bullet graphs
const pm25Ranges = [
  { label: "Good", value: 12, color: "bg-green-500" },
  { label: "Moderate", value: 35.4, color: "bg-yellow-500" },
  { label: "Unhealthy for Sensitive", value: 55.4, color: "bg-orange-500" },
  { label: "Unhealthy", value: 150.4, color: "bg-red-500" },
  { label: "Very Unhealthy", value: 250.4, color: "bg-purple-500" },
  { label: "Hazardous", value: 350.4, color: "bg-rose-700" },
];

const pm10Ranges = [
  { label: "Good", value: 54, color: "bg-green-500" },
  { label: "Moderate", value: 154, color: "bg-yellow-500" },
  { label: "Unhealthy for Sensitive", value: 254, color: "bg-orange-500" },
  { label: "Unhealthy", value: 354, color: "bg-red-500" },
  { label: "Very Unhealthy", value: 424, color: "bg-purple-500" },
  { label: "Hazardous", value: 504, color: "bg-rose-700" },
];

const no2Ranges = [
    { label: "Good", value: 40, color: "bg-green-500" },
    { label: "Moderate", value: 80, color: "bg-yellow-500" },
    { label: "Unhealthy for Sensitive", value: 180, color: "bg-orange-500" },
    { label: "Unhealthy", value: 280, color: "bg-red-500" },
    { label: "Very Unhealthy", value: 400, color: "bg-purple-500" },
    { label: "Hazardous", value: 500, color: "bg-rose-700" },
];

export default function AqiDashboard({ onSearch, isPending, forecast, aqiData, initialLocation }: AqiDashboardProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialLocation || "",
    },
  });

  // Sync the form's location value with the parent component's state.
  // This is useful for updates from outside the form, like voice commands.
  useEffect(() => {
    form.setValue('location', initialLocation);
  }, [initialLocation, form.setValue]);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values.location);
  }

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-green-500";
    if (aqi <= 100) return "text-yellow-500";
    if (aqi <= 150) return "text-orange-500";
    if (aqi <= 200) return "text-red-500";
    if (aqi <= 300) return "text-purple-500";
    return "text-rose-700";
  };
  
  const getAqiDescription = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Air Quality Forecast</CardTitle>
        <CardDescription>Enter a location to get the 72-hour AQI forecast.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4 mb-6">
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="e.g., San Francisco" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Get Forecast
            </Button>
          </form>
        </Form>

        {isPending && !aqiData && <DashboardSkeleton />}

        {aqiData && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Current Conditions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                <Card className="sm:col-span-2">
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <p className="text-sm font-medium text-muted-foreground">AQI</p>
                        <p className={`text-7xl font-bold ${getAqiColor(aqiData.aqi)}`}>{aqiData.aqi}</p>
                        <p className="font-medium">{getAqiDescription(aqiData.aqi)}</p>
                    </CardContent>
                </Card>
                <BulletGraph title="PM2.5" value={aqiData.pm25} unit="µg/m³" ranges={pm25Ranges} max={350} />
                <BulletGraph title="PM10" value={aqiData.pm10} unit="µg/m³" ranges={pm10Ranges} max={500} />
                <BulletGraph title="NO₂" value={aqiData.no2} unit="µg/m³" ranges={no2Ranges} max={500} />
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Temperature</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 flex items-center justify-center gap-4">
                        <Thermometer className="h-10 w-10 text-primary" />
                        <p className="text-4xl font-semibold">{aqiData.temp}°C</p>
                    </CardContent>
                </Card>
              </div>
            </div>

            {forecast && (
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">AI Generated Forecast</h3>
                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                        <p className="text-sm text-foreground">{forecast}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const DashboardSkeleton = () => (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-36 w-full sm:col-span-2" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
        </div>
      </div>
      <div>
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
)

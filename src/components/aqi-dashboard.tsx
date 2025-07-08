"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { MapPin, Wind, Thermometer, Cloud, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "./ui/skeleton";
import type { ForecastAqiOutput } from "@/ai/flows/forecast-aqi";

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

export default function AqiDashboard({ onSearch, isPending, forecast, aqiData, initialLocation }: AqiDashboardProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: initialLocation || "",
    },
  });

  // Keep form value in sync with the current location from parent
  form.watch((value) => {
    if (value.location !== initialLocation) {
        form.setValue('location', initialLocation);
    }
  });


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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <Card>
                  <CardContent className="p-4">
                    <p className={`text-5xl font-bold ${getAqiColor(aqiData.aqi)}`}>{aqiData.aqi}</p>
                    <p className="text-sm font-medium text-muted-foreground">{getAqiDescription(aqiData.aqi)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Wind className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-semibold">{aqiData.pm25} <span className="text-sm text-muted-foreground">µg/m³</span></p>
                    <p className="text-xs text-muted-foreground">PM2.5</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Cloud className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-semibold">{aqiData.pm10} <span className="text-sm text-muted-foreground">µg/m³</span></p>
                    <p className="text-xs text-muted-foreground">PM10</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Thermometer className="h-8 w-8 text-primary mb-2" />
                    <p className="text-2xl font-semibold">{aqiData.temp}°C</p>
                    <p className="text-xs text-muted-foreground">Temperature</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

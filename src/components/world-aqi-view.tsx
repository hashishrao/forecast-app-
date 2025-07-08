"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe } from "lucide-react";
import { getWorldAqiAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { WorldAqiOutput } from "@/ai/flows/world-aqi";
import { cn } from "@/lib/utils";

type CountryAqi = WorldAqiOutput['countries'][0];

const getAqiColorClass = (aqi: number) => {
    if (aqi <= 50) return "bg-green-500";
    if (aqi <= 100) return "bg-yellow-500";
    if (aqi <= 150) return "bg-orange-500";
    if (aqi <= 200) return "bg-red-500";
    if (aqi <= 300) return "bg-purple-500";
    return "bg-rose-700";
};

const getAqiDescription = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
};

export default function WorldAqiView() {
    const [countries, setCountries] = useState<CountryAqi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const result = await getWorldAqiAction();
            if (result.success && result.data) {
                setCountries(result.data.countries);
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to fetch world AQI data.",
                });
            }
            setIsLoading(false);
        };
        fetchData();
    }, [toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Globe />
                    World Air Quality
                </CardTitle>
                <CardDescription>
                    Live AQI from major cities around the globe.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[360px]">
                    <div className="space-y-4 pr-4">
                        {isLoading ? (
                            Array.from({ length: 8 }).map((_, i) => <CountrySkeleton key={i} />)
                        ) : (
                            countries.map((country, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={cn("h-3 w-3 rounded-full", getAqiColorClass(country.aqi))} title={getAqiDescription(country.aqi)}></span>
                                        <span className="font-medium text-sm">{country.name}</span>
                                    </div>
                                    <span className="font-semibold text-sm">{country.aqi}</span>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

const CountrySkeleton = () => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-12" />
    </div>
);

"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SchoolZoneMap from '@/components/school-zone-map';
import { getNearbySchoolsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { School as SchoolIcon, MapPin, Navigation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { FindNearbySchoolsOutput } from "@/ai/flows/find-nearby-schools";
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

type School = FindNearbySchoolsOutput['schools'][0];

const getAqiColorClass = (aqi: number) => {
    if (aqi <= 50) return "text-green-600";
    if (aqi <= 100) return "text-yellow-600";
    if (aqi <= 150) return "text-orange-600";
    if (aqi <= 200) return "text-red-600";
    if (aqi <= 300) return "text-purple-700";
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

export default function SchoolZonePage() {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [schools, setSchools] = useState<School[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    toast({
                        variant: "destructive",
                        title: "Location Error",
                        description: "Could not retrieve your location. Please enable location services.",
                    });
                    setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Fallback to New Delhi
                }
            );
        } else {
            toast({
                variant: "destructive",
                title: "Geolocation Not Supported",
                description: "Your browser does not support geolocation.",
            });
            setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Fallback to New Delhi
        }
    }, [toast]);

    useEffect(() => {
        if (userLocation) {
            setIsLoading(true);
            const fetchSchools = async () => {
                const result = await getNearbySchoolsAction({ lat: userLocation.lat, lon: userLocation.lng });
                if (result.success && result.data) {
                    setSchools(result.data.schools);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error || "Could not fetch nearby schools.",
                    });
                }
                setIsLoading(false);
            };
            fetchSchools();
        }
    }, [userLocation, toast]);

    const mapCenter = useMemo(() => {
        if (selectedSchool) {
            return { lat: selectedSchool.lat, lng: selectedSchool.lon };
        }
        return userLocation || { lat: 28.6139, lng: 77.2090 };
    }, [selectedSchool, userLocation]);

    const mapZoom = useMemo(() => {
        return selectedSchool ? 15 : 14; // A bit more zoomed out by default
    }, [selectedSchool]);

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 max-w-screen-2xl items-center">
                    <div className="mr-4 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <Logo className="h-6 w-6 text-primary" />
                            <h1 className="text-xl font-bold text-foreground">BreatheEasy</h1>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 md:p-8">
                <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-2">
                    <div className="lg:col-span-1">
                        <Card className="h-[calc(100vh-10rem)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <SchoolIcon className="text-primary" />
                                    School Zone AQI
                                </CardTitle>
                                <CardDescription>
                                    This map shows schools in a 5km radius with their local air quality.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-7.5rem)]">
                                {userLocation ? (
                                    <SchoolZoneMap
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        schools={schools}
                                        selectedSchool={selectedSchool}
                                        onMarkerClick={setSelectedSchool}
                                        userLocation={userLocation}
                                    />
                                ) : (
                                    <div className="flex items-center justify-center h-full bg-muted rounded-lg">
                                        <p className="text-muted-foreground">Getting your location...</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col h-[calc(100vh-10rem)]">
                         <Card className="flex-1 flex flex-col">
                            <CardHeader>
                                <CardTitle>Nearby Schools</CardTitle>
                                <CardDescription>Click a school to view it on the map.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full pr-2">
                                    <div className="space-y-3">
                                        {isLoading && !schools.length ? (
                                            Array.from({ length: 4 }).map((_, i) => (
                                                <div key={i} className="space-y-2 p-3 border rounded-lg">
                                                    <Skeleton className="h-5 w-3/4" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-1/4" />
                                                </div>
                                            ))
                                        ) : schools.length > 0 ? (
                                            schools.map(school => (
                                                <button
                                                    key={school.name}
                                                    onClick={() => setSelectedSchool(school)}
                                                    className={cn(
                                                        "w-full text-left p-3 border rounded-lg transition-all hover:bg-muted/50",
                                                        selectedSchool?.name === school.name && "bg-muted ring-2 ring-primary"
                                                    )}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="relative w-24 h-24 flex-shrink-0">
                                                            <Image
                                                                src={school.imageUrl}
                                                                alt={`Image of ${school.name}`}
                                                                layout="fill"
                                                                objectFit="cover"
                                                                className="rounded-md"
                                                                data-ai-hint="school building"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-semibold">{school.name}</p>
                                                                <div className="text-right">
                                                                    <p className={`text-sm font-bold ${getAqiColorClass(school.aqi)}`}>AQI: {school.aqi}</p>
                                                                    <p className="text-xs text-muted-foreground">{getAqiDescription(school.aqi)}</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                <span>{school.address}</span>
                                                            </p>
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                                className="mt-2"
                                                                onClick={(e) => e.stopPropagation()} // Prevent card click
                                                            >
                                                                <a
                                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${school.lat},${school.lon}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                >
                                                                    <Navigation className="mr-2 h-4 w-4" />
                                                                    Get Directions
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-muted-foreground text-center">No schools found nearby.</p>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

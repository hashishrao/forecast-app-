"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import EmergencyMap from '@/components/emergency-map';
import { getNearbyHospitalsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Ambulance, MapPin, Navigation } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { FindNearbyHospitalsOutput } from "@/ai/flows/find-nearby-hospitals";
import { Logo } from '@/components/icons/logo';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

type Hospital = FindNearbyHospitalsOutput['hospitals'][0];

export default function EmergencyPage() {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
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
                        description: "Could not retrieve your location. Please enable location services in your browser.",
                    });
                    setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Fallback location
                }
            );
        } else {
            toast({
                variant: "destructive",
                title: "Geolocation Not Supported",
                description: "Your browser does not support geolocation.",
            });
            setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Fallback location
        }
    }, [toast]);

    useEffect(() => {
        if (userLocation) {
            setIsLoading(true);
            const fetchHospitals = async () => {
                const result = await getNearbyHospitalsAction({ lat: userLocation.lat, lon: userLocation.lng });
                if (result.success && result.data) {
                    setHospitals(result.data.hospitals);
                } else {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: result.error || "Could not fetch nearby hospitals.",
                    });
                }
                setIsLoading(false);
            };
            fetchHospitals();
        }
    }, [userLocation, toast]);

    const emergencyContacts = [
        { name: "National Emergency Number", number: "112" },
        { name: "Police", number: "100" },
        { name: "Fire", number: "101" },
        { name: "Ambulance", number: "102" },
        { name: "Disaster Management", number: "108" },
    ];

    const mapCenter = useMemo(() => {
        if (selectedHospital) {
            return { lat: selectedHospital.lat, lng: selectedHospital.lon };
        }
        return userLocation || { lat: 28.6139, lng: 77.2090 };
    }, [selectedHospital, userLocation]);

    const mapZoom = useMemo(() => {
        return selectedHospital ? 15 : 13;
    }, [selectedHospital]);

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
                                    <Ambulance className="text-red-500" />
                                    Nearby Medical Facilities
                                </CardTitle>
                                <CardDescription>
                                    This map shows your location and nearby hospitals. Click a hospital to see details.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-7.5rem)]">
                                {userLocation ? (
                                    <EmergencyMap
                                        center={mapCenter}
                                        zoom={mapZoom}
                                        hospitals={hospitals}
                                        selectedHospital={selectedHospital}
                                        onMarkerClick={setSelectedHospital}
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

                    <div className="space-y-6">
                        <Card>
                             <CardHeader>
                                <CardTitle>Emergency Contacts</CardTitle>
                                <CardDescription>Toll-free numbers for India.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {emergencyContacts.map(contact => (
                                        <li key={contact.name} className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{contact.name}</span>
                                            <a href={`tel:${contact.number}`} className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                                                <Phone className="h-4 w-4" />
                                                {contact.number}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="flex flex-col h-[calc(100vh-27rem)]">
                            <CardHeader>
                                <CardTitle>Nearby Hospitals List</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-hidden">
                                <ScrollArea className="h-full pr-2">
                                    <div className="space-y-3">
                                        {isLoading && !hospitals.length ? (
                                            Array.from({ length: 3 }).map((_, i) => (
                                                <div key={i} className="space-y-2 p-3 border rounded-lg">
                                                    <Skeleton className="h-5 w-3/4" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-1/4" />
                                                </div>
                                            ))
                                        ) : hospitals.length > 0 ? (
                                            hospitals.map(hospital => (
                                                <button
                                                    key={hospital.name}
                                                    onClick={() => setSelectedHospital(hospital)}
                                                    className={cn(
                                                        "w-full text-left p-3 border rounded-lg transition-all hover:bg-muted/50",
                                                        selectedHospital?.name === hospital.name && "bg-muted ring-2 ring-primary"
                                                    )}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="relative w-24 h-24 flex-shrink-0">
                                                            <Image
                                                                src={hospital.imageUrl}
                                                                alt={`Image of ${hospital.name}`}
                                                                layout="fill"
                                                                objectFit="cover"
                                                                className="rounded-md"
                                                                data-ai-hint="hospital building"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <p className="font-semibold">{hospital.name}</p>
                                                                <p className="text-sm font-bold text-primary">{hospital.distance}</p>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground flex items-start gap-1 mt-1">
                                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                <span>{hospital.address}</span>
                                                            </p>
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                                size="sm"
                                                                className="mt-2"
                                                                onClick={(e) => e.stopPropagation()} // Prevent card click
                                                            >
                                                                <a
                                                                    href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lon}`}
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
                                            <p className="text-muted-foreground text-center">No hospitals found nearby.</p>
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

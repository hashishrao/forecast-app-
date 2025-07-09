"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import EmergencyMap from '@/components/emergency-map';
import { getNearbyHospitalsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Phone, Ambulance } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { FindNearbyHospitalsOutput } from "@/ai/flows/find-nearby-hospitals";
import { Logo } from '@/components/icons/logo';

type Hospital = FindNearbyHospitalsOutput['hospitals'][0];

export default function EmergencyPage() {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(true);
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
                    // Fallback location
                    setUserLocation({ lat: 28.6139, lng: 77.2090 });
                }
            );
        } else {
            toast({
                variant: "destructive",
                title: "Geolocation Not Supported",
                description: "Your browser does not support geolocation.",
            });
            // Fallback location
            setUserLocation({ lat: 28.6139, lng: 77.2090 });
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
                <div className="grid gap-6 md:gap-8 grid-cols-1 lg:grid-cols-3">
                    <div className="lg:col-span-2">
                        <Card className="h-[calc(100vh-10rem)]">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Ambulance className="text-red-500" />
                                    Nearby Medical Facilities
                                </CardTitle>
                                <CardDescription>
                                    This map shows your current location and nearby hospitals.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-7.5rem)]">
                                {userLocation ? (
                                    <EmergencyMap center={userLocation} zoom={13} hospitals={hospitals} />
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

                        <Card>
                            <CardHeader>
                                <CardTitle>Nearby Hospitals List</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {isLoading && !hospitals.length ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="space-y-2">
                                                <Skeleton className="h-5 w-3/4" />
                                                <Skeleton className="h-4 w-full" />
                                            </div>
                                        ))
                                    ) : (
                                        hospitals.map(hospital => (
                                            <div key={hospital.name}>
                                                <p className="font-semibold">{hospital.name}</p>
                                                <p className="text-sm text-muted-foreground">{hospital.address}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
"use client";

import * as React from "react";
import { MapPin, Calendar, User, Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { LocationPicker } from "@/components/maps/LocationPicker";
import { DatePicker } from "./DatePicker";
import { useRouter } from "next/navigation";
import { useJsApiLoader } from "@react-google-maps/api";
import { cn } from "@/lib/utils";

export function SearchForm() {
    const router = useRouter();
    const [from, setFrom] = React.useState<{ address: string; lat: number; lng: number } | null>(null);
    const [to, setTo] = React.useState<{ address: string; lat: number; lng: number } | null>(null);
    const [date, setDate] = React.useState("");
    const [passengers, setPassengers] = React.useState("1");
    const [isListening, setIsListening] = React.useState(false);
    const [isEvOnly, setIsEvOnly] = React.useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (from) {
            params.set("from", from.address);
            params.set("fromLat", from.lat.toString());
            params.set("fromLng", from.lng.toString());
        }
        if (to) {
            params.set("to", to.address);
            params.set("toLat", to.lat.toString());
            params.set("toLng", to.lng.toString());
        }
        if (date) params.set("date", date);
        if (passengers) params.set("passengers", passengers);
        if (isEvOnly) params.set("ev", "true");

        router.push(`/search?${params.toString()}`);
    };

    const geocodeAndSetTo = (address: string) => {
        if (!isLoaded || !window.google) return;

        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions(
            {
                input: address,
                componentRestrictions: { country: "in" },
                types: ["geocode"],
            },
            (predictions, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions && predictions[0]) {
                    const placeId = predictions[0].place_id;
                    const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));

                    placesService.getDetails({ placeId: placeId }, (place, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                            setTo({
                                address: place.formatted_address || address,
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng(),
                            });
                        }
                    });
                }
            }
        );
    };

    const handleVoiceSearch = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice search is not supported in this browser.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            // Simple logic: assume the user is saying the destination
            // In a real app, we might parse "from X to Y"
            geocodeAndSetTo(transcript);
        };

        recognition.start();
    };

    const handleExampleClick = () => {
        geocodeAndSetTo("Mumbai");
    };

    return (
        <GlassCard className="w-full max-w-md mx-auto space-y-4">
            <div className="flex space-x-2">
                <LocationPicker
                    placeholder="Leaving from"
                    onLocationSelect={(location) => setFrom(location)}
                    value={from?.address}
                />
                <LocationPicker
                    placeholder="Going to"
                    onLocationSelect={(location) => setTo(location)}
                    value={to?.address}
                />
            </div>

            <div className="flex space-x-2">
                <DatePicker
                    value={date}
                    onChange={setDate}
                    placeholder="Select Date"
                />
                <div className="relative flex-1">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                    <Input
                        type="number"
                        placeholder="1 Passenger"
                        className="pl-10"
                        value={passengers}
                        onChange={(e) => setPassengers(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between px-1">
                <div className="flex items-center space-x-2">
                    <Zap className={cn("h-4 w-4", isEvOnly ? "text-green-500 fill-green-500" : "text-muted-foreground")} />
                    <span className="text-sm font-medium">EV Only</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isEvOnly}
                        onChange={(e) => setIsEvOnly(e.target.checked)}
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
            </div>

            <Button
                className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20"
                size="lg"
                onClick={handleSearch}
            >
                <Search className="mr-2 h-5 w-5" />
                Search Rides
            </Button>
        </GlassCard>
    );
}

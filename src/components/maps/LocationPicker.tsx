"use client";

import * as React from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { Input } from "../ui/input";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationPickerProps {
    placeholder?: string;
    onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
    defaultValue?: string;
    className?: string;
    value?: string;
}

export function LocationPicker({ placeholder, onLocationSelect, defaultValue, className, value: externalValue }: LocationPickerProps) {
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    const [value, setValue] = React.useState(defaultValue || "");

    React.useEffect(() => {
        if (externalValue !== undefined) {
            setValue(externalValue);
        }
    }, [externalValue]);
    const [predictions, setPredictions] = React.useState<google.maps.places.AutocompletePrediction[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [autocompleteService, setAutocompleteService] = React.useState<google.maps.places.AutocompleteService | null>(null);
    const [placesService, setPlacesService] = React.useState<google.maps.places.PlacesService | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (isLoaded && !autocompleteService && window.google) {
            setAutocompleteService(new window.google.maps.places.AutocompleteService());
            // We need a dummy element for PlacesService, but we can also use Geocoder which doesn't need an element
            // However, PlacesService is often better for place details.
            // Let's use Geocoder for simplicity as it doesn't require a map instance or DOM element
        }
    }, [isLoaded, autocompleteService]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setValue(val);

        if (!val) {
            setPredictions([]);
            setIsOpen(false);
            return;
        }

        if (autocompleteService) {
            autocompleteService.getPlacePredictions(
                {
                    input: val,
                    componentRestrictions: { country: "in" },
                    types: ["geocode"],
                },
                (predictions, status) => {
                    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
                        setPredictions(predictions);
                        setIsOpen(true);
                    } else {
                        setPredictions([]);
                        setIsOpen(false);
                    }
                }
            );
        }
    };

    const handleSelect = (prediction: google.maps.places.AutocompletePrediction) => {
        setValue(prediction.description);
        setIsOpen(false);

        if (!placesService && window.google && wrapperRef.current) {
            // Initialize PlacesService if not already done. 
            // Note: We need to handle the case where it might not be ready immediately in this render cycle if we just set it.
            // But we can create a temporary one or rely on the effect.
            // Let's create a new instance here to be safe and immediate.
            const service = new window.google.maps.places.PlacesService(document.createElement('div'));
            setPlacesService(service);

            service.getDetails({ placeId: prediction.place_id }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                    const location = {
                        address: place.formatted_address || prediction.description,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    onLocationSelect(location);
                }
            });
            return;
        }

        if (placesService) {
            placesService.getDetails({ placeId: prediction.place_id }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && place && place.geometry && place.geometry.location) {
                    const location = {
                        address: place.formatted_address || prediction.description,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    onLocationSelect(location);
                }
            });
        }
    };

    if (!isLoaded) {
        return (
            <div className={cn("relative flex-1", className)}>
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder={placeholder || "Loading..."}
                    className="pl-10"
                    value={value}
                    onChange={handleInputChange}
                    disabled
                />
            </div>
        );
    }

    return (
        <div className={cn("relative flex-1", className)} ref={wrapperRef}>
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
                ref={inputRef}
                placeholder={placeholder || "Enter location"}
                className="pl-10"
                value={value}
                onChange={handleInputChange}
                onFocus={() => value && predictions.length > 0 && setIsOpen(true)}
            />

            {isOpen && predictions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-xl overflow-hidden">
                    <ul className="max-h-60 overflow-auto py-1">
                        {predictions.map((prediction) => (
                            <li
                                key={prediction.place_id}
                                className="px-4 py-2 hover:bg-zinc-800 cursor-pointer text-sm text-zinc-100 transition-colors flex items-start gap-2"
                                onClick={() => handleSelect(prediction)}
                            >
                                <MapPin className="h-4 w-4 mt-0.5 text-zinc-400 shrink-0" />
                                <div>
                                    <div className="font-medium">{prediction.structured_formatting.main_text}</div>
                                    <div className="text-xs text-zinc-400">{prediction.structured_formatting.secondary_text}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="px-2 py-1 bg-zinc-900 border-t border-zinc-800 flex justify-end">
                        <img
                            src="https://developers.google.com/maps/documentation/images/powered_by_google_on_non_white.png"
                            alt="Powered by Google"
                            className="h-4 opacity-70"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

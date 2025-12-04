"use client";

import * as React from "react";
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from "@react-google-maps/api";
import { Navigation } from "lucide-react";
import { Button } from "../ui/button";

const mapContainerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "12px",
};

const defaultCenter = {
    lat: 28.6139, // Delhi
    lng: 77.2090,
};

interface MapViewProps {
    origin?: { lat: number; lng: number };
    destination?: { lat: number; lng: number };
    waypoints?: Array<{ lat: number; lng: number; label?: string }>;
    markers?: Array<{ lat: number; lng: number; label?: string }>;
    showLiveLocation?: boolean;
    onLocationUpdate?: (location: { lat: number; lng: number }) => void;
}

export function MapView({
    origin,
    destination,
    waypoints,
    markers,
    showLiveLocation = false,
    onLocationUpdate,
}: MapViewProps) {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries: ["places"],
    });

    const [directions, setDirections] = React.useState<google.maps.DirectionsResult | null>(null);
    const [map, setMap] = React.useState<google.maps.Map | null>(null);
    const [liveLocation, setLiveLocation] = React.useState<{ lat: number; lng: number } | null>(null);
    const [watchId, setWatchId] = React.useState<number | null>(null);
    const [routeInfo, setRouteInfo] = React.useState<{ distance: string; duration: string } | null>(null);

    // Calculate route with waypoints
    React.useEffect(() => {
        if (isLoaded && origin && destination) {
            const directionsService = new google.maps.DirectionsService();

            const request: google.maps.DirectionsRequest = {
                origin: origin,
                destination: destination,
                travelMode: google.maps.TravelMode.DRIVING,
                optimizeWaypoints: true,
            };

            if (waypoints && waypoints.length > 0) {
                request.waypoints = waypoints.map(wp => ({
                    location: new google.maps.LatLng(wp.lat, wp.lng),
                    stopover: true,
                }));
            }

            directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);

                    // Calculate total distance and duration
                    const route = result.routes[0];
                    let totalDistance = 0;
                    let totalDuration = 0;

                    route.legs.forEach(leg => {
                        totalDistance += leg.distance?.value || 0;
                        totalDuration += leg.duration?.value || 0;
                    });

                    setRouteInfo({
                        distance: `${(totalDistance / 1000).toFixed(1)} km`,
                        duration: `${Math.round(totalDuration / 60)} min`,
                    });
                }
            });
        }
    }, [isLoaded, origin, destination, waypoints]);

    // Live location tracking
    React.useEffect(() => {
        if (showLiveLocation && navigator.geolocation) {
            const id = navigator.geolocation.watchPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setLiveLocation(location);
                    onLocationUpdate?.(location);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                }
            );
            setWatchId(id);

            return () => {
                if (id) {
                    navigator.geolocation.clearWatch(id);
                }
            };
        }
    }, [showLiveLocation, onLocationUpdate]);

    const onLoad = React.useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = React.useCallback(() => {
        setMap(null);
    }, []);

    const centerOnLiveLocation = () => {
        if (liveLocation && map) {
            map.panTo(liveLocation);
            map.setZoom(15);
        }
    };

    if (loadError) {
        return (
            <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
                <p className="text-muted-foreground">Error loading maps</p>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const center = liveLocation || origin || destination || defaultCenter;

    return (
        <div className="relative">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={origin && destination ? 8 : 12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                }}
            >
                {directions ? (
                    <DirectionsRenderer
                        directions={directions}
                        options={{
                            suppressMarkers: false,
                            polylineOptions: {
                                strokeColor: "#3b82f6",
                                strokeWeight: 5,
                            },
                        }}
                    />
                ) : (
                    <>
                        {markers?.map((marker, index) => (
                            <Marker
                                key={index}
                                position={marker}
                                label={marker.label}
                            />
                        ))}
                        {origin && <Marker position={origin} label="A" />}
                        {destination && <Marker position={destination} label="B" />}
                        {waypoints?.map((waypoint, index) => (
                            <Marker
                                key={`waypoint-${index}`}
                                position={waypoint}
                                label={waypoint.label || `${index + 1}`}
                            />
                        ))}
                    </>
                )}

                {/* Live location marker */}
                {liveLocation && (
                    <Marker
                        position={liveLocation}
                        icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 10,
                            fillColor: "#4285F4",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        }}
                    />
                )}
            </GoogleMap>

            {/* Route info overlay */}
            {routeInfo && (
                <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
                    <div className="text-sm font-medium">Route Information</div>
                    <div className="text-xs text-muted-foreground mt-1">
                        Distance: {routeInfo.distance}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Duration: {routeInfo.duration}
                    </div>
                </div>
            )}

            {/* Live location button */}
            {showLiveLocation && liveLocation && (
                <Button
                    size="sm"
                    className="absolute bottom-4 right-4"
                    onClick={centerOnLiveLocation}
                >
                    <Navigation className="h-4 w-4 mr-2" />
                    Center on Me
                </Button>
            )}
        </div>
    );
}

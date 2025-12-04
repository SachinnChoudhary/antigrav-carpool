// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

// Estimate duration based on distance (rough estimate)
export function estimateDuration(distanceKm: number): number {
    // Assume average speed of 60 km/h
    const hours = distanceKm / 60;
    return Math.round(hours * 60); // Return minutes
}

// Format duration for display
export function formatDuration(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${mins} min`;
}

// Calculate price based on distance (in INR)
// Formula: Base price + (distance × 2.8)
export function calculatePrice(distanceKm: number, baseRate: number = 30, perKmRate: number = 2.8): number {
    // Base rate + per km rate
    const price = baseRate + (distanceKm * perKmRate);
    return Math.round(price * 100) / 100; // Round to 2 decimal places
}

// Get suggested price range
export function getPriceRange(distanceKm: number): { min: number; max: number; suggested: number } {
    const suggested = calculatePrice(distanceKm);
    const min = Math.round(suggested * 0.8 * 100) / 100; // 20% lower
    const max = Math.round(suggested * 1.2 * 100) / 100; // 20% higher

    return { min, max, suggested };
}

// Optimize route with multiple waypoints
export async function optimizeRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    waypoints?: Array<{ lat: number; lng: number }>
): Promise<{
    distance: number;
    duration: number;
    optimizedWaypoints?: Array<{ lat: number; lng: number }>;
} | null> {
    try {
        const directionsService = new google.maps.DirectionsService();

        const request: google.maps.DirectionsRequest = {
            origin: new google.maps.LatLng(origin.lat, origin.lng),
            destination: new google.maps.LatLng(destination.lat, destination.lng),
            travelMode: google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
        };

        if (waypoints && waypoints.length > 0) {
            request.waypoints = waypoints.map(wp => ({
                location: new google.maps.LatLng(wp.lat, wp.lng),
                stopover: true,
            }));
        }

        return new Promise((resolve, reject) => {
            directionsService.route(request, (result, status) => {
                if (status === google.maps.DirectionsStatus.OK && result) {
                    const route = result.routes[0];
                    let totalDistance = 0;
                    let totalDuration = 0;

                    route.legs.forEach(leg => {
                        totalDistance += leg.distance?.value || 0;
                        totalDuration += leg.duration?.value || 0;
                    });

                    resolve({
                        distance: totalDistance / 1000, // Convert to km
                        duration: Math.round(totalDuration / 60), // Convert to minutes
                        optimizedWaypoints: route.waypoint_order?.map(index => waypoints![index]),
                    });
                } else {
                    reject(new Error('Route optimization failed'));
                }
            });
        });
    } catch (error) {
        console.error('Route optimization error:', error);
        return null;
    }
}

// Get current location
export async function getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            },
            (error) => {
                console.error('Geolocation error:', error);
                resolve(null);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    });
}

// Watch location (for live tracking)
export function watchLocation(
    callback: (location: { lat: number; lng: number }) => void
): number | null {
    if (!navigator.geolocation) {
        return null;
    }

    return navigator.geolocation.watchPosition(
        (position) => {
            callback({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            });
        },
        (error) => {
            console.error('Geolocation watch error:', error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Stop watching location
export function stopWatchingLocation(watchId: number) {
    navigator.geolocation.clearWatch(watchId);
}

// Geocode an address to coordinates (requires Google Maps API)
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                address
            )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        }

        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

// Reverse geocode coordinates to address
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            return data.results[0].formatted_address;
        }

        return null;
    } catch (error) {
        console.error("Reverse geocoding error:", error);
        return null;
    }
}

"use client";

import * as React from "react";
import { RideCard } from "@/components/rides/RideCard";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { SlidersHorizontal, Map as MapIcon, List, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { MapView } from "@/components/maps/MapView";

// Mock Data - Expanded with more routes
const RIDES = [
    {
        id: 1,
        driverName: "Rahul Kumar",
        rating: 4.8,
        price: 850,
        from: "Delhi",
        fromDetail: "Connaught Place, Delhi",
        to: "Chandigarh",
        toDetail: "Sector 17, Chandigarh",
        time: "05:30 PM",
        duration: "4h 30m",
        seats: 2,
        isVerified: true,
        amenities: ["ac", "music"]
    },
    {
        id: 2,
        driverName: "Priya Singh",
        rating: 4.9,
        price: 900,
        from: "Delhi",
        fromDetail: "Delhi Airport (T3)",
        to: "Chandigarh",
        toDetail: "Mohali Phase 7",
        time: "06:00 PM",
        duration: "4h 15m",
        seats: 3,
        isVerified: true,
        amenities: ["ac", "pet_friendly"]
    },
    {
        id: 3,
        driverName: "Amit Sharma",
        rating: 4.5,
        price: 750,
        from: "Delhi",
        fromDetail: "Kashmere Gate",
        to: "Chandigarh",
        toDetail: "Zirakpur",
        time: "07:15 PM",
        duration: "5h 00m",
        seats: 1,
        isVerified: false,
        amenities: ["music"]
    },
    {
        id: 4,
        driverName: "Vikram Malhotra",
        rating: 4.7,
        price: 1200,
        from: "Gurgaon",
        fromDetail: "Gurgaon Cyber Hub",
        to: "Chandigarh",
        toDetail: "Chandigarh IT Park",
        time: "04:00 PM",
        duration: "4h 45m",
        seats: 2,
        isVerified: true,
        amenities: ["ac", "music", "charger"]
    },
    {
        id: 5,
        driverName: "Neha Kapoor",
        rating: 4.9,
        price: 1500,
        from: "Delhi",
        fromDetail: "Connaught Place",
        to: "Mumbai",
        toDetail: "Bandra West",
        time: "08:00 PM",
        duration: "24h 00m",
        seats: 2,
        isVerified: true,
        amenities: ["ac", "music", "charger"]
    },
    {
        id: 6,
        driverName: "Arjun Mehta",
        rating: 4.6,
        price: 600,
        from: "Mumbai",
        fromDetail: "Andheri East",
        to: "Pune",
        toDetail: "Koregaon Park",
        time: "09:00 AM",
        duration: "3h 30m",
        seats: 3,
        isVerified: true,
        amenities: ["ac", "music"]
    }
];

const FILTERS = [
    { id: "all", label: "All" },
    { id: "cheapest", label: "Cheapest" },
    { id: "fastest", label: "Fastest" },
    { id: "verified", label: "Verified Only" },
];

export default function SearchPage() {
    const searchParams = useSearchParams();
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";
    const fromLat = parseFloat(searchParams.get("fromLat") || "0");
    const fromLng = parseFloat(searchParams.get("fromLng") || "0");
    const toLat = parseFloat(searchParams.get("toLat") || "0");
    const toLng = parseFloat(searchParams.get("toLng") || "0");
    const passengers = searchParams.get("passengers") || "2";
    const date = searchParams.get("date") || "";

    const [viewMode, setViewMode] = React.useState<"list" | "map">("list");
    const [activeFilter, setActiveFilter] = React.useState("all");
    const [rides, setRides] = React.useState<any[]>([]);
    const [filteredRides, setFilteredRides] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Fetch rides from API
    React.useEffect(() => {
        const fetchRides = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (from) params.set("from", from);
                if (to) params.set("to", to);
                if (date) params.set("date", date);
                if (passengers) params.set("passengers", passengers);

                const response = await fetch(`/api/rides/search?${params.toString()}`);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Search API error:", response.status, errorText);
                    throw new Error(`Search failed: ${response.status}`);
                }

                const data = await response.json();

                setRides(data.rides || []);
                setFilteredRides(data.rides || []);
            } catch (error) {
                console.error("Failed to fetch rides:", error);
                setRides([]);
                setFilteredRides([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, [from, to, date, passengers]);

    // Apply filters
    React.useEffect(() => {
        let result = [...rides];

        // Apply additional filters
        if (activeFilter === "cheapest") {
            result.sort((a, b) => a.price - b.price);
        } else if (activeFilter === "fastest") {
            result.sort((a, b) => {
                const getMinutes = (str: string) => {
                    if (!str || str === "N/A") return Infinity;
                    const match = str.match(/(\d+)h\s*(\d+)m/);
                    if (match) return parseInt(match[1]) * 60 + parseInt(match[2]);
                    return Infinity;
                };
                return getMinutes(a.duration) - getMinutes(b.duration);
            });
        } else if (activeFilter === "verified") {
            result = result.filter(ride => ride.isVerified);
        }

        setFilteredRides(result);
    }, [activeFilter, rides]);

    const routeTitle = from && to ? `${from} → ${to}` : "Search Results";

    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />

            {/* Sticky Filter Bar */}
            <div className="sticky top-[72px] z-40 bg-background/80 backdrop-blur-md border-b border-white/20">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold">{routeTitle}</h1>
                        <p className="text-xs text-muted-foreground">
                            {filteredRides.length} {filteredRides.length === 1 ? 'ride' : 'rides'} • {passengers} Passenger{passengers !== "1" ? 's' : ''}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full h-10 w-10"
                            onClick={() => setViewMode(viewMode === "list" ? "map" : "list")}
                        >
                            {viewMode === "list" ? <MapIcon className="h-5 w-5" /> : <List className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Filter Chips */}
                <div className="px-6 pb-4 flex space-x-2 overflow-x-auto no-scrollbar">
                    {FILTERS.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                                activeFilter === filter.id
                                    ? "bg-primary text-white shadow-lg shadow-primary/25"
                                    : "bg-white/50 text-muted-foreground hover:bg-white border border-white/20"
                            )}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 py-6 min-h-[500px]">
                <AnimatePresence mode="wait">
                    {viewMode === "list" ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            {filteredRides.length > 0 ? (
                                filteredRides.map((ride) => (
                                    <RideCard
                                        key={ride.id}
                                        id={ride.id}
                                        driverName={ride.driverName}
                                        rating={ride.rating}
                                        price={ride.price}
                                        from={ride.fromDetail}
                                        to={ride.toDetail}
                                        time={ride.time}
                                        duration={ride.duration}
                                        seats={ride.seats}
                                        isVerified={ride.isVerified}
                                    />
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                        <Filter className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-semibold">No rides found</h3>
                                    <p className="text-muted-foreground text-sm mt-1">
                                        {from && to
                                            ? `No rides available from ${from} to ${to}`
                                            : "Try adjusting your search criteria"
                                        }
                                    </p>
                                    <Button
                                        variant="link"
                                        onClick={() => setActiveFilter("all")}
                                        className="mt-2 text-primary"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-[60vh] rounded-3xl overflow-hidden relative border border-white/20 shadow-xl"
                        >
                            {/* Real Map View with Google Maps */}
                            {fromLat !== 0 && fromLng !== 0 && toLat !== 0 && toLng !== 0 ? (
                                <MapView
                                    origin={{ lat: fromLat, lng: fromLng }}
                                    destination={{ lat: toLat, lng: toLng }}
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                                    <div className="text-center p-6">
                                        <MapIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                        <p className="text-gray-500 font-medium">Map View</p>
                                        <p className="text-xs text-gray-400">Select origin and destination to view route</p>
                                    </div>
                                </div>
                            )}

                            {/* Floating Card on Map */}
                            {filteredRides.length > 0 && (
                                <div className="absolute bottom-4 left-4 right-4">
                                    <GlassCard className="p-3 flex items-center justify-between bg-white/90 backdrop-blur-xl">
                                        <div>
                                            <p className="text-xs font-bold text-primary">Selected Ride</p>
                                            <p className="text-sm font-semibold">{filteredRides[0].driverName} • ₹{filteredRides[0].price}</p>
                                        </div>
                                        <Button size="sm" className="h-8">Book</Button>
                                    </GlassCard>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomNav />
        </main>
    );
}

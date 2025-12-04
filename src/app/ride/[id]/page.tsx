import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { User, ShieldCheck, Star, Info, MessageCircle, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

export default async function RideDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const ride = await prisma.ride.findUnique({
        where: { id },
        include: {
            driver: {
                select: {
                    id: true,
                    name: true,
                    rating: true,
                    verified: true,
                    totalRides: true,
                    profileImage: true,
                    bio: true,
                    vehicles: {
                        where: { id: { not: undefined } }, // Just to get type safety if needed, but we rely on ride.vehicleId
                        take: 1
                    }
                }
            },
            vehicle: true
        }
    });

    if (!ride) {
        notFound();
    }

    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />

            {/* Map Placeholder */}
            <div className="h-48 w-full bg-gray-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
                {/* Replaced text with a subtle pattern or just empty as requested */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            <div className="px-6 -mt-12 relative z-10 space-y-6">
                <GlassCard className="space-y-4">
                    <div className="flex justify-between items-start">
                        <h1 className="text-2xl font-bold">{ride.from} → {ride.to}</h1>
                        <span className="text-xl font-bold text-primary">₹{ride.price}</span>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex items-start space-x-3">
                            <div className="mt-1">
                                <div className="h-3 w-3 rounded-full border-2 border-primary bg-background" />
                                <div className="h-10 w-0.5 bg-gray-300 ml-1.5 my-1" />
                                <div className="h-3 w-3 rounded-full bg-primary" />
                            </div>
                            <div className="flex-1 space-y-6">
                                <div>
                                    <p className="font-semibold">{ride.time}</p>
                                    <p className="text-sm text-muted-foreground">{ride.from}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">
                                        {/* Estimate arrival time roughly +4 hours for demo if not stored */}
                                        Approx. Arrival
                                    </p>
                                    <p className="text-sm text-muted-foreground">{ride.to}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-gray-100">
                            <MapPin className="h-4 w-4" />
                            <span>{format(new Date(ride.date), 'EEEE, MMMM d, yyyy')}</span>
                        </div>
                    </div>
                </GlassCard>

                <GlassCard className="space-y-4">
                    <h2 className="font-semibold text-lg">Driver</h2>
                    <div className="flex items-center justify-between">
                        <Link href={`/profile/${ride.driver.id}`} className="flex items-center space-x-3 flex-1">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl overflow-hidden">
                                {ride.driver.profileImage ? (
                                    <img src={ride.driver.profileImage} alt={ride.driver.name} className="h-full w-full object-cover" />
                                ) : (
                                    ride.driver.name.charAt(0)
                                )}
                            </div>
                            <div>
                                <div className="flex items-center space-x-1">
                                    <h3 className="font-semibold hover:underline">{ride.driver.name}</h3>
                                    {ride.driver.verified && <ShieldCheck className="h-4 w-4 text-green-500" />}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                    {ride.driver.rating.toFixed(1)} • {ride.driver.totalRides} rides
                                </div>
                            </div>
                        </Link>
                        <Link href={`/chat/${ride.driver.id}`}>
                            <Button variant="outline" size="icon" className="rounded-full">
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                    {ride.vehicle ? (
                        <p className="text-sm text-muted-foreground">
                            "I drive a {ride.vehicle.color} {ride.vehicle.make} {ride.vehicle.model}. {ride.driver.bio}"
                        </p>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            "{ride.driver.bio || "No bio available."}"
                        </p>
                    )}
                </GlassCard>

                <GlassCard className="space-y-4">
                    <h2 className="font-semibold text-lg">Ride Info</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{ride.seats} seats available</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>Instant Booking</span>
                        </div>
                    </div>
                </GlassCard>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/20 z-50">
                <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/30" size="lg">
                    Book Ride
                </Button>
            </div>
        </main>
    );
}

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/glass-card";
import { Star, ShieldCheck, Car, Calendar, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            vehicles: true,
            ridesAsDriver: {
                where: { status: 'active' },
                orderBy: { date: 'asc' },
                take: 3
            }
        }
    });

    if (!user) {
        notFound();
    }

    const reviews = await prisma.review.findMany({
        where: {
            ride: {
                driverId: id
            }
        },
        include: {
            reviewer: {
                select: { name: true, profileImage: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });

    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />

            <div className="px-6 py-6 space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/30">
                        {user.profileImage ? (
                            <img src={user.profileImage} alt={user.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                            user.name.charAt(0)
                        )}
                    </div>

                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                            <h1 className="text-2xl font-bold">{user.name}</h1>
                            {user.verified && (
                                <ShieldCheck className="h-5 w-5 text-green-500" />
                            )}
                        </div>
                        <div className="flex items-center justify-center mt-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="font-medium text-foreground">{user.rating.toFixed(1)}</span>
                            <span className="mx-1">•</span>
                            <span>{user.totalRides} rides</span>
                        </div>
                    </div>

                    {user.bio && (
                        <p className="text-center text-muted-foreground max-w-xs mx-auto italic">
                            "{user.bio}"
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <GlassCard className="flex flex-col items-center justify-center p-4">
                        <span className="text-xl font-bold">{new Date(user.createdAt).getFullYear()}</span>
                        <span className="text-xs text-muted-foreground uppercase">Member Since</span>
                    </GlassCard>
                    <GlassCard className="flex flex-col items-center justify-center p-4">
                        {/* co2Saved is not in schema, using placeholder or calculating if possible. For now removing or mocking */}
                        <span className="text-xl font-bold text-green-600">120kg</span>
                        <span className="text-xs text-muted-foreground uppercase">CO₂ Saved</span>
                    </GlassCard>
                </div>

                {/* Vehicles */}
                <div className="space-y-3">
                    <h2 className="font-semibold px-1">Vehicles</h2>
                    {user.vehicles.length > 0 ? (
                        user.vehicles.map((vehicle) => (
                            <GlassCard key={vehicle.id} className="flex items-center p-3">
                                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center mr-3">
                                    <Car className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{vehicle.color} • {vehicle.fuelType || 'Petrol'}</p>
                                </div>
                            </GlassCard>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground px-1">No vehicles listed.</p>
                    )}
                </div>

                {/* Reviews */}
                <div className="space-y-3">
                    <h2 className="font-semibold px-1">Recent Reviews</h2>
                    {reviews.length > 0 ? (
                        <div className="space-y-3">
                            {reviews.map((review) => (
                                <GlassCard key={review.id} className="p-3">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                                                {review.reviewer.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium">{review.reviewer.name}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                            <span className="text-xs font-bold">{review.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                                </GlassCard>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground px-1">No reviews yet.</p>
                    )}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}

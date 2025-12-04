import * as React from "react";
import { Star, ShieldCheck } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";

import Link from "next/link";

interface RideCardProps {
    id: string;
    driverName: string;
    rating: number;
    price: number;
    from: string;
    to: string;
    time: string;
    duration: string;
    seats: number;
    isVerified?: boolean;
}

export function RideCard({
    id,
    driverName,
    rating,
    price,
    from,
    to,
    time,
    duration,
    seats,
    isVerified = false,
}: RideCardProps) {
    return (
        <Link href={`/ride/${id}`} className="block">
            <GlassCard className="group hover:bg-white/60 transition-all duration-300 cursor-pointer border-white/40">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-lg">
                                {driverName[0]}
                            </div>
                            {isVerified && (
                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5 border-2 border-white">
                                    <ShieldCheck className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{driverName}</h3>
                            <div className="flex items-center text-xs text-muted-foreground">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {rating} • {seats} seats left
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-xl font-bold text-primary">₹{price}</span>
                    </div>
                </div>

                <div className="relative pl-4 border-l-2 border-dashed border-gray-300 ml-2 space-y-6">
                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-foreground">{time}</p>
                                <p className="text-sm text-muted-foreground">{from}</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary" />
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium text-foreground">
                                    {/* Calculate arrival time roughly or just show duration */}
                                    <span className="text-xs font-normal text-muted-foreground block mb-1">
                                        {duration}
                                    </span>
                                    Drop-off
                                </p>
                                <p className="text-sm text-muted-foreground">{to}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <Button size="sm" className="rounded-full px-6">
                        Book
                    </Button>
                </div>
            </GlassCard>
        </Link>
    );
}

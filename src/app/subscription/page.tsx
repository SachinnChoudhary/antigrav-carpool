"use client";

import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, ShieldCheck } from "lucide-react";

export default function SubscriptionPage() {
    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />

            <div className="px-6 space-y-6 text-center">
                <div className="flex justify-center mb-4">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                        <Crown className="h-10 w-10" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold">Go Premium</h1>
                <p className="text-muted-foreground">Unlock exclusive benefits and save on every ride.</p>

                <div className="grid gap-6 mt-8">
                    {/* Monthly Plan */}
                    <GlassCard className="relative border-2 border-primary/50 bg-primary/5">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                            MOST POPULAR
                        </div>
                        <h2 className="text-xl font-bold mb-2">Monthly Pass</h2>
                        <div className="flex items-baseline justify-center space-x-1 mb-4">
                            <span className="text-3xl font-bold">₹499</span>
                            <span className="text-muted-foreground">/month</span>
                        </div>

                        <ul className="space-y-3 text-left mb-6">
                            <li className="flex items-center space-x-3">
                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Check className="h-3 w-3" />
                                </div>
                                <span className="text-sm">Zero service fees</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Check className="h-3 w-3" />
                                </div>
                                <span className="text-sm">Priority booking</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <Check className="h-3 w-3" />
                                </div>
                                <span className="text-sm">Free cancellation</span>
                            </li>
                        </ul>

                        <Button className="w-full font-bold shadow-lg shadow-primary/20">
                            Start Free Trial
                        </Button>
                    </GlassCard>

                    {/* Commuter Pass */}
                    <GlassCard className="opacity-80 grayscale hover:grayscale-0 transition-all duration-300">
                        <h2 className="text-xl font-bold mb-2">Commuter Pass</h2>
                        <div className="flex items-baseline justify-center space-x-1 mb-4">
                            <span className="text-3xl font-bold">₹299</span>
                            <span className="text-muted-foreground">/10 rides</span>
                        </div>

                        <ul className="space-y-3 text-left mb-6">
                            <li className="flex items-center space-x-3">
                                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <Zap className="h-3 w-3" />
                                </div>
                                <span className="text-sm">Save ₹30 per ride</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                                    <ShieldCheck className="h-3 w-3" />
                                </div>
                                <span className="text-sm">Ride insurance included</span>
                            </li>
                        </ul>

                        <Button variant="outline" className="w-full font-bold">
                            Choose Plan
                        </Button>
                    </GlassCard>
                </div>
            </div>
        </main>
    );
}

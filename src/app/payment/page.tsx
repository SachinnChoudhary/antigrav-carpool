"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { CreditCard, Wallet, Banknote, ChevronRight, Users, ShieldCheck, Info } from "lucide-react";
import Link from "next/link";

export default function PaymentPage() {
    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />

            <div className="px-6 space-y-6">
                <h1 className="text-2xl font-bold">Payment</h1>

                {/* Trip Summary */}
                <GlassCard className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="font-semibold">Delhi → Chandigarh</h2>
                            <p className="text-sm text-muted-foreground">Today, 5:30 PM</p>
                        </div>
                        <span className="text-xl font-bold text-primary">₹850</span>
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Ride Fare</span>
                            <span>₹800</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center">
                                Service Fee <Info className="h-3 w-3 ml-1" />
                            </span>
                            <span>₹50</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-2">
                            <span>Total Payable</span>
                            <span>₹850</span>
                        </div>
                    </div>
                </GlassCard>

                {/* Split Fare */}
                <GlassCard className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/40 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-medium">Split Fare</h3>
                            <p className="text-xs text-muted-foreground">Share cost with friends</p>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full">Add</Button>
                </GlassCard>

                {/* Payment Methods */}
                <div className="space-y-3">
                    <h2 className="font-semibold px-2">Payment Method</h2>

                    <GlassCard className="p-0 overflow-hidden">
                        <button className="flex items-center justify-between w-full p-4 hover:bg-white/40 transition-colors border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-medium">UPI / Wallet</h3>
                                    <p className="text-xs text-muted-foreground">Google Pay, PhonePe, Paytm</p>
                                </div>
                            </div>
                            <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                                <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                            </div>
                        </button>

                        <button className="flex items-center justify-between w-full p-4 hover:bg-white/40 transition-colors border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                    <CreditCard className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-medium">Credit / Debit Card</h3>
                                    <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                                </div>
                            </div>
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        </button>

                        <button className="flex items-center justify-between w-full p-4 hover:bg-white/40 transition-colors">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                    <Banknote className="h-5 w-5" />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-medium">Cash on Pickup</h3>
                                    <p className="text-xs text-muted-foreground">Pay directly to driver</p>
                                </div>
                            </div>
                            <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                        </button>
                    </GlassCard>
                </div>

                {/* Subscription Promo */}
                <GlassCard className="bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-primary">Go Premium</h3>
                                <p className="text-xs text-muted-foreground">Save ₹50 on this ride</p>
                            </div>
                        </div>
                        <Button size="sm" className="rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                            View Plans
                        </Button>
                    </div>
                </GlassCard>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/20 z-50">
                <Button className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/30" size="lg">
                    Pay ₹850
                </Button>
            </div>
        </main>
    );
}

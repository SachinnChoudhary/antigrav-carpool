"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, FileText, AlertTriangle, CheckCircle } from "lucide-react";

export default function SafetyPage() {
    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />

            <div className="px-6 py-6 space-y-6">
                <h1 className="text-2xl font-bold">Safety & Trust</h1>

                <GlassCard className="bg-green-500/10 border-green-500/20">
                    <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                            <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg">Trust Score: 850</h2>
                            <p className="text-sm text-muted-foreground">Excellent! You are a trusted member.</p>
                        </div>
                    </div>
                </GlassCard>

                <div className="space-y-4">
                    <h2 className="font-semibold px-2">Pending Verifications</h2>

                    <GlassCard className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="font-medium">Government ID (Aadhaar)</span>
                            </div>
                            <Button size="sm" variant="outline" className="h-8">Upload</Button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="font-medium">Driving License</span>
                            </div>
                            <Button size="sm" variant="outline" className="h-8">Upload</Button>
                        </div>
                    </GlassCard>
                </div>

                <div className="space-y-4">
                    <h2 className="font-semibold px-2">Completed Verifications</h2>
                    <GlassCard className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium">Phone Number</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Verified</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-500" />
                                <span className="font-medium">Email Address</span>
                            </div>
                            <span className="text-xs text-muted-foreground">Verified</span>
                        </div>
                    </GlassCard>
                </div>

                <GlassCard className="bg-red-500/5 border-red-500/20 mt-8">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-bold text-red-500 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            SOS Emergency
                        </h2>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                        Press and hold for 3 seconds to alert emergency contacts and police.
                    </p>
                    <Button variant="destructive" className="w-full h-12 font-bold shadow-lg shadow-red-500/20">
                        SOS ALERT
                    </Button>
                </GlassCard>
            </div>

            <BottomNav />
        </main>
    );
}

"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { QrCode, Wallet } from "lucide-react";

export function WalletPass() {
    return (
        <div className="relative w-full max-w-sm mx-auto perspective-1000 group cursor-pointer">
            <div className="relative transform transition-transform duration-500 group-hover:rotate-y-12 preserve-3d">
                {/* Top Section */}
                <div className="bg-[#1D1D1F] text-white p-6 rounded-t-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Wallet className="h-32 w-32 transform rotate-12" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center space-x-2">
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center font-bold">A</div>
                                <span className="font-semibold tracking-wide">Antigravity</span>
                            </div>
                            <span className="text-xs font-mono opacity-60">PASS-8392</span>
                        </div>

                        <div className="space-y-1 mb-8">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Origin</p>
                            <h2 className="text-2xl font-bold">New Delhi</h2>
                            <p className="text-xs text-gray-400">Connaught Place, Block C</p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-gray-400 uppercase tracking-wider">Destination</p>
                            <h2 className="text-2xl font-bold text-primary">Chandigarh</h2>
                            <p className="text-xs text-gray-400">Sector 17 Plaza</p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-8 bg-[#1D1D1F] relative flex items-center justify-between px-[-10px]">
                    <div className="h-8 w-4 bg-background rounded-r-full" />
                    <div className="h-[2px] w-full border-t-2 border-dashed border-gray-700 mx-2" />
                    <div className="h-8 w-4 bg-background rounded-l-full" />
                </div>

                {/* Bottom Section */}
                <div className="bg-[#1D1D1F] text-white p-6 rounded-b-3xl flex justify-between items-center">
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase">Date</p>
                            <p className="font-semibold">Nov 24, 2025</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase">Time</p>
                            <p className="font-semibold">05:30 PM</p>
                        </div>
                    </div>

                    <div className="bg-white p-2 rounded-xl">
                        <QrCode className="h-16 w-16 text-black" />
                    </div>
                </div>
            </div>
        </div>
    );
}

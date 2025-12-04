"use client";

import { Header } from "@/components/layout/Header";
import { WalletPass } from "@/components/rides/WalletPass";
import { Button } from "@/components/ui/button";
import { Share2, Download } from "lucide-react";

export default function TicketPage() {
    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30 flex flex-col items-center">
            <Header />

            <div className="w-full max-w-md px-6 space-y-8 mt-8">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold">Your Ticket</h1>
                    <p className="text-muted-foreground">Show this QR code to the driver</p>
                </div>

                <WalletPass />

                <div className="flex space-x-4">
                    <Button variant="outline" className="flex-1 space-x-2">
                        <Share2 className="h-4 w-4" />
                        <span>Share</span>
                    </Button>
                    <Button className="flex-1 space-x-2 shadow-lg shadow-primary/20">
                        <Download className="h-4 w-4" />
                        <span>Save to Wallet</span>
                    </Button>
                </div>
            </div>
        </main>
    );
}

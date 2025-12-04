"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { RideFormWithMaps } from "@/components/rides/RideFormWithMaps";
import toast from "react-hot-toast";

export default function PublishRidePage() {
    const handlePublish = (data: any) => {
        console.log("Published ride data:", data);
        toast.success("Ride published successfully!");
    };

    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30">
            <Header />
            <div className="px-6 py-6 max-w-4xl mx-auto">
                <RideFormWithMaps onSubmit={handlePublish} />
            </div>
        </main>
    );
}

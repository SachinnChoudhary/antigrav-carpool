"use client";

import * as React from "react";
import { Car, Zap, ShieldCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
    { id: "all", label: "All Rides", icon: Car },
    { id: "express", label: "Express", icon: Zap },
    { id: "women", label: "Women Only", icon: ShieldCheck },
    { id: "community", label: "Community", icon: Users },
];

export function CategoryFilter() {
    const [active, setActive] = React.useState("all");

    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 pt-2 px-4 no-scrollbar">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => setActive(cat.id)}
                    className={cn(
                        "flex flex-col items-center justify-center min-w-[80px] p-3 rounded-2xl transition-all duration-300",
                        active === cat.id
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105"
                            : "bg-white/50 text-muted-foreground hover:bg-white/80"
                    )}
                >
                    <cat.icon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-medium">{cat.label}</span>
                </button>
            ))}
        </div>
    );
}

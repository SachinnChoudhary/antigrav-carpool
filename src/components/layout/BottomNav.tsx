"use client";

import * as React from "react";
import { Home, Search, PlusCircle, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const navItems = [
    { icon: Home, label: "Home", active: true },
    { icon: Search, label: "Find", active: false },
    { icon: PlusCircle, label: "Publish", active: false, highlight: true },
    { icon: MessageSquare, label: "Inbox", active: false },
    { icon: User, label: "Profile", active: false },
];

interface BottomNavProps {
    className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
    return (
        <nav className={cn("fixed bottom-0 left-0 right-0 z-50 pb-safe glass border-t border-white/20", className)}>
            <div className="flex items-center justify-around px-2 py-3">
                <Link href="/" className="flex flex-col items-center justify-center w-full space-y-1 text-muted-foreground hover:text-foreground">
                    <div className="h-6 w-6 flex items-center justify-center">
                        <Home className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-medium">Home</span>
                </Link>
                <Link href="/search" className="flex flex-col items-center justify-center w-full space-y-1 text-muted-foreground hover:text-foreground">
                    <div className="h-6 w-6 flex items-center justify-center">
                        <Search className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-medium">Find</span>
                </Link>
                <Link href="/publish" className="flex flex-col items-center justify-center w-full space-y-1 text-primary -mt-6">
                    <div className="h-14 w-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 flex items-center justify-center transition-transform hover:scale-105">
                        <PlusCircle className="h-6 w-6" />
                    </div>
                </Link>
                <Link href="/inbox" className="flex flex-col items-center justify-center w-full space-y-1 text-muted-foreground hover:text-foreground">
                    <div className="h-6 w-6 flex items-center justify-center">
                        <MessageSquare className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-medium">Inbox</span>
                </Link>
                <Link href="/profile" className="flex flex-col items-center justify-center w-full space-y-1 text-muted-foreground hover:text-foreground">
                    <div className="h-6 w-6 flex items-center justify-center">
                        <User className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-medium">Profile</span>
                </Link>
            </div>
        </nav>
    );
}

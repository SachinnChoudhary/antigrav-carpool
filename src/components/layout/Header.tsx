"use client";

import * as React from "react";
import { Bell, Menu, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DynamicIsland } from "@/components/ui/dynamic-island";
import Link from "next/link";

interface HeaderProps {
    title?: string;
}

export function Header({ title }: HeaderProps) {
    const [showMenu, setShowMenu] = React.useState(false);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass border-b-0">
            <DynamicIsland />
            <div className="flex items-center space-x-2">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                    A
                </div>
                <span className="text-xl font-bold tracking-tight">{title || "Antigravity"}</span>
            </div>
            <div className="flex items-center space-x-2 relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="h-6 w-6" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    onClick={() => setShowMenu(!showMenu)}
                >
                    {showMenu ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>

                {/* Menu Dropdown */}
                {showMenu && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setShowMenu(false)}
                        />
                        <div className="absolute right-0 top-14 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50 border border-gray-200 dark:border-gray-700">
                            <Link
                                href="/support"
                                className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => setShowMenu(false)}
                            >
                                <HelpCircle className="h-5 w-5 mr-3 text-primary" />
                                <span className="font-medium">Help & Support</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}

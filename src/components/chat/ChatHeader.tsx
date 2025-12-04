"use client";

import { ArrowLeft, Phone, MoreVertical, User, Flag, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface ChatHeaderProps {
    title: string;
    profileImage?: string | null;
    isGroup?: boolean;
    online?: boolean;
    userId?: string;
}

export function ChatHeader({ title, profileImage, isGroup, online, userId }: ChatHeaderProps) {
    const router = useRouter();
    const [showMenu, setShowMenu] = useState(false);

    const handleReport = async () => {
        if (!userId) return;

        const reporterId = localStorage.getItem("userId") || "ba37ca56-85f0-4f4d-9ca2-45386cd05e1d";

        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reporterId,
                    reportedId: userId,
                    reason: "Inappropriate behavior", // Default reason for now
                    description: "Reported from chat"
                }),
            });

            if (res.ok) {
                toast.success("User reported successfully. The admin team has been notified.");
            } else {
                throw new Error("Failed to report");
            }
        } catch (error) {
            toast.error("Failed to report user. Please try again.");
        }
        setShowMenu(false);
    };

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 py-2 bg-[#202c33] text-[#e9edef] border-b border-[#2a3942]">
            <div className="flex items-center">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-[#aebac1] hover:bg-[#374248] hover:text-[#e9edef] mr-1"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-6 w-6" />
                </Button>

                <div className="flex items-center cursor-pointer" onClick={() => userId && router.push(`/profile/${userId}`)}>
                    <div className="h-9 w-9 rounded-full bg-gray-600 overflow-hidden mr-3">
                        {profileImage ? (
                            <img src={profileImage} alt={title} className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-[#6a7175] text-white font-bold">
                                {title.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-base leading-tight">{title}</span>
                        <span className="text-xs text-[#8696a0]">Replies within 1 hr</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-1 relative">
                <Button variant="ghost" size="icon" className="rounded-full text-[#aebac1] hover:bg-[#374248] hover:text-[#e9edef]">
                    <Phone className="h-5 w-5" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-[#aebac1] hover:bg-[#374248] hover:text-[#e9edef]"
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <MoreVertical className="h-5 w-5" />
                </Button>

                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-10 w-48 bg-[#233138] rounded-lg shadow-lg py-2 z-50 border border-[#2a3942]">
                            {userId && (
                                <Link href={`/profile/${userId}`} className="flex items-center px-4 py-3 hover:bg-[#182229] transition-colors text-[#e9edef] text-sm">
                                    <User className="h-4 w-4 mr-3 text-[#aebac1]" />
                                    View Profile
                                </Link>
                            )}
                            {userId && (
                                <Link href={`/profile/${userId}`} className="flex items-center px-4 py-3 hover:bg-[#182229] transition-colors text-[#e9edef] text-sm">
                                    <Car className="h-4 w-4 mr-3 text-[#aebac1]" />
                                    Check Rides
                                </Link>
                            )}
                            <button
                                className="w-full flex items-center px-4 py-3 hover:bg-[#182229] transition-colors text-[#e9edef] text-sm text-left"
                                onClick={handleReport}
                            >
                                <Flag className="h-4 w-4 mr-3 text-[#aebac1]" />
                                Report User
                            </button>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
}

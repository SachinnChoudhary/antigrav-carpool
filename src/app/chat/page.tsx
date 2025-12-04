"use client";

import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEffect, useState } from "react";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Conversation {
    user: {
        id: string;
        name: string;
        profileImage: string | null;
    };
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
}

export default function ChatListPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                // TODO: Get actual logged in user ID
                const userId = localStorage.getItem("userId") || "ba37ca56-85f0-4f4d-9ca2-45386cd05e1d";
                const res = await fetch(`/api/chats?userId=${userId}`);
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data.conversations);
                }
            } catch (error) {
                console.error("Failed to fetch chats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, []);

    return (
        <main className="min-h-screen bg-[#111b21] text-[#e9edef] flex flex-col">
            <div className="px-4 py-4 flex items-center justify-between sticky top-0 bg-[#111b21] z-10">
                <h1 className="text-2xl font-bold">Chats</h1>
                <div className="flex space-x-4 text-[#aebac1]">
                    <Search className="h-6 w-6" />
                    <MoreVertical className="h-6 w-6" />
                </div>
            </div>

            <div className="px-3 mb-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#aebac1]" />
                    <Input
                        placeholder="Search..."
                        className="pl-10 bg-[#202c33] border-none rounded-lg h-9 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="text-center text-[#8696a0] mt-10">Loading chats...</div>
                ) : conversations.length === 0 ? (
                    <div className="text-center text-[#8696a0] mt-10">
                        <p>No conversations yet.</p>
                        <p className="text-sm">Book a ride to start chatting!</p>
                    </div>
                ) : (
                    conversations.map((conv) => (
                        <Link href={`/chat/${conv.user.id}`} key={conv.user.id}>
                            <div className="flex items-center px-4 py-3 hover:bg-[#202c33] transition-colors cursor-pointer">
                                <div className="h-12 w-12 rounded-full bg-gray-600 flex items-center justify-center text-white font-bold text-lg mr-3 overflow-hidden flex-shrink-0">
                                    {conv.user.profileImage ? (
                                        <img src={conv.user.profileImage} alt={conv.user.name} className="h-full w-full object-cover" />
                                    ) : (
                                        conv.user.name.charAt(0)
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 border-b border-[#202c33] pb-3">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-normal text-lg truncate text-[#e9edef]">{conv.user.name}</h3>
                                        <span className="text-xs text-[#8696a0] whitespace-nowrap ml-2">
                                            {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-0.5">
                                        <p className="text-sm text-[#8696a0] truncate pr-2">
                                            {conv.lastMessage}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="h-5 w-5 rounded-full bg-[#00a884] text-[10px] flex items-center justify-center text-[#111b21] font-bold flex-shrink-0">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            <BottomNav className="bg-[#202c33] border-t border-[#2a3942]" />
        </main>
    );
}

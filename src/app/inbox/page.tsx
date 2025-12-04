"use client";

import { useState, useEffect } from 'react';
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle, ArrowLeft } from "lucide-react";
import { ChatWindow } from "@/components/chat/ChatWindow";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Conversation {
    id: string;
    otherUser: {
        id: string;
        name: string;
        profileImage?: string;
        role: string;
    };
    lastMessage: {
        content: string;
        createdAt: string;
        senderId: string;
    } | null;
    unreadCount: number;
    ride: {
        from: string;
        to: string;
        date: string;
        status: string;
    };
    status: string;
}

export default function InboxPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCurrentUser();
        fetchConversations();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
    };

    const fetchConversations = async () => {
        try {
            const response = await fetch('/api/chat/conversations');
            if (response.ok) {
                const data = await response.json();
                setConversations(data.conversations);
            } else {
                toast.error('Failed to load conversations');
            }
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredConversations = conversations.filter(conv =>
        conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        // Mark as read locally
        setConversations(prev => prev.map(c =>
            c.id === conversation.id ? { ...c, unreadCount: 0 } : c
        ));
    };

    return (
        <main className="min-h-screen pt-24 pb-24 bg-gradient-to-b from-background to-secondary/30 flex flex-col">
            <Header />

            <div className="flex-1 max-w-7xl mx-auto w-full px-4 flex gap-6 h-[calc(100vh-180px)]">
                {/* Conversation List - Hidden on mobile if chat is open */}
                <div className={`w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4 ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search messages..."
                            className="pl-9 bg-white/50 backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground">
                                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No messages yet</p>
                            </div>
                        ) : (
                            filteredConversations.map((conv) => (
                                <GlassCard
                                    key={conv.id}
                                    className={`p-3 cursor-pointer transition-all hover:bg-white/60 ${selectedConversation?.id === conv.id ? 'border-primary bg-white/60 shadow-md' : ''
                                        }`}
                                    onClick={() => handleSelectConversation(conv)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                                                {conv.otherUser.profileImage ? (
                                                    <Image src={conv.otherUser.profileImage} alt={conv.otherUser.name} width={48} height={48} className="object-cover" />
                                                ) : (
                                                    conv.otherUser.name[0]
                                                )}
                                            </div>
                                            {conv.unreadCount > 0 && (
                                                <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                                                    {conv.unreadCount}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-semibold truncate">{conv.otherUser.name}</h4>
                                                {conv.lastMessage && (
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                        {new Date(conv.lastMessage.createdAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {conv.ride.from} → {conv.ride.to}
                                            </p>
                                            <p className={`text-sm truncate mt-1 ${conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                                                {conv.lastMessage?.content || 'Start a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Window - Full width on mobile if open */}
                <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
                    {selectedConversation && currentUser ? (
                        <div className="h-full flex flex-col">
                            <div className="md:hidden mb-2">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedConversation(null)} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" /> Back to Inbox
                                </Button>
                            </div>
                            <div className="flex-1 bg-white/40 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl overflow-hidden">
                                <ChatWindow
                                    bookingId={selectedConversation.id}
                                    currentUserId={currentUser.id}
                                    otherUser={selectedConversation.otherUser}
                                    variant="embedded"
                                    onClose={() => setSelectedConversation(null)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-2xl border border-white/10">
                            <div className="text-center text-muted-foreground">
                                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                <h3 className="text-xl font-semibold mb-2">Your Inbox</h3>
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, HelpCircle, ArrowLeft, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { SupportChatList } from "@/components/support/SupportChatList";
import { SupportChatWindow } from "@/components/support/SupportChatWindow";

export default function SupportPage() {
    const router = useRouter();
    const [chats, setChats] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [showNewChatForm, setShowNewChatForm] = React.useState(false);
    const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);
    const [newChatSubject, setNewChatSubject] = React.useState("");
    const [newChatMessage, setNewChatMessage] = React.useState("");
    const [newChatPriority, setNewChatPriority] = React.useState("medium");
    const [creating, setCreating] = React.useState(false);

    React.useEffect(() => {
        loadChats();
    }, []);

    const loadChats = async () => {
        try {
            const response = await fetch("/api/support-chat");
            if (response.ok) {
                const data = await response.json();
                setChats(data.chats);
            } else {
                const error = await response.json();
                console.error("API Error:", error);
                toast.error(error.error || "Failed to load support chats");
            }
        } catch (error) {
            console.error("Network Error:", error);
            toast.error("Failed to load support chats");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChatSubject.trim() || !newChatMessage.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setCreating(true);
        try {
            const response = await fetch("/api/support-chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: newChatSubject,
                    message: newChatMessage,
                    priority: newChatPriority,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                toast.success("Support chat created successfully");
                setNewChatSubject("");
                setNewChatMessage("");
                setNewChatPriority("medium");
                setShowNewChatForm(false);
                setSelectedChatId(data.chat.id);
                loadChats();
            } else {
                const error = await response.json();
                console.error("API Error:", error);
                toast.error(error.error || "Failed to create support chat");
            }
        } catch (error) {
            console.error("Network Error:", error);
            toast.error("Failed to create support chat");
        } finally {
            setCreating(false);
        }
    };

    if (selectedChatId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <SupportChatWindow
                        chatId={selectedChatId}
                        onClose={() => {
                            setSelectedChatId(null);
                            loadChats();
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.back()}
                                className="rounded-full"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">Help & Support</h1>
                                <p className="text-sm text-muted-foreground">
                                    Get help from our support team
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowNewChatForm(!showNewChatForm)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            New Chat
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* New Chat Form */}
                {showNewChatForm && (
                    <GlassCard className="p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Start a New Support Chat</h3>
                        <form onSubmit={handleCreateChat} className="space-y-4">
                            <div>
                                <Label htmlFor="subject">Subject</Label>
                                <Input
                                    id="subject"
                                    value={newChatSubject}
                                    onChange={(e) => setNewChatSubject(e.target.value)}
                                    placeholder="Brief description of your issue"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="message">Message</Label>
                                <textarea
                                    id="message"
                                    value={newChatMessage}
                                    onChange={(e) => setNewChatMessage(e.target.value)}
                                    placeholder="Describe your issue in detail..."
                                    required
                                    className="w-full min-h-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </div>
                            <div>
                                <Label htmlFor="priority">Priority</Label>
                                <select
                                    id="priority"
                                    value={newChatPriority}
                                    onChange={(e) => setNewChatPriority(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={creating}>
                                    {creating ? "Creating..." : "Create Chat"}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowNewChatForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                )}

                {/* Chat List */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Your Support Chats</h2>
                    {loading ? (
                        <GlassCard className="p-8 text-center">
                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                        </GlassCard>
                    ) : (
                        <SupportChatList
                            chats={chats}
                            onSelectChat={(chatId) => setSelectedChatId(chatId)}
                        />
                    )}
                </div>

                {/* Help Resources */}
                {!showNewChatForm && chats.length === 0 && (
                    <GlassCard className="p-8 mt-6">
                        <div className="text-center">
                            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
                            <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
                            <p className="text-muted-foreground mb-6">
                                Start a chat with our support team and we'll get back to you as soon as possible.
                            </p>
                            <Button onClick={() => setShowNewChatForm(true)} className="gap-2">
                                <MessageCircle className="h-4 w-4" />
                                Chat with Support
                            </Button>
                        </div>
                    </GlassCard>
                )}
            </div>
        </div>
    );
}

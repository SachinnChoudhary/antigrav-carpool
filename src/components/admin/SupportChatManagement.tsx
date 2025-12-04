"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, User, Clock, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { AdminChatWindow } from "@/components/admin/AdminChatWindow";

interface Chat {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    unreadCount: number;
    user: {
        id: string;
        name: string;
        email: string;
        profileImage?: string;
    };
    admin?: {
        id: string;
        name: string;
    };
    messages: Array<{
        content: string;
        createdAt: string;
    }>;
    _count: {
        messages: number;
    };
}

export function SupportChatManagement() {
    const [chats, setChats] = React.useState<Chat[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState("all");
    const [selectedChatId, setSelectedChatId] = React.useState<string | null>(null);

    React.useEffect(() => {
        loadChats();
        // Auto-refresh every 5 seconds
        const interval = setInterval(loadChats, 5000);
        return () => clearInterval(interval);
    }, [filter]);

    const loadChats = async () => {
        try {
            const response = await fetch(`/api/admin/support-chats?status=${filter}`);
            if (response.ok) {
                const data = await response.json();
                setChats(data.chats);
            } else {
                toast.error("Failed to load support chats");
            }
        } catch (error) {
            console.error("Failed to load support chats");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (chatId: string, status: string) => {
        try {
            const response = await fetch("/api/admin/support-chats", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chatId, status }),
            });

            if (response.ok) {
                toast.success("Status updated");
                loadChats();
            } else {
                toast.error("Failed to update status");
            }
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "open":
                return "bg-blue-500";
            case "in_progress":
                return "bg-yellow-500";
            case "resolved":
                return "bg-green-500";
            case "closed":
                return "bg-gray-500";
            default:
                return "bg-gray-500";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "text-red-600 bg-red-50";
            case "high":
                return "text-orange-600 bg-orange-50";
            case "medium":
                return "text-yellow-600 bg-yellow-50";
            case "low":
                return "text-green-600 bg-green-50";
            default:
                return "text-gray-600 bg-gray-50";
        }
    };

    if (selectedChatId) {
        return (
            <AdminChatWindow
                chatId={selectedChatId}
                onClose={() => {
                    setSelectedChatId(null);
                    loadChats();
                }}
            />
        );
    }

    const openChatsCount = chats.filter((c) => c.status === "open").length;
    const inProgressCount = chats.filter((c) => c.status === "in_progress").length;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">Total Chats</p>
                    <p className="text-2xl font-bold">{chats.length}</p>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">Open</p>
                    <p className="text-2xl font-bold text-blue-600">{openChatsCount}</p>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">In Progress</p>
                    <p className="text-2xl font-bold text-yellow-600">{inProgressCount}</p>
                </GlassCard>
                <GlassCard className="p-4">
                    <p className="text-sm text-muted-foreground">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">
                        {chats.filter((c) => c.status === "resolved").length}
                    </p>
                </GlassCard>
            </div>

            {/* Filters */}
            <GlassCard className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={filter === "all" ? "default" : "outline"}
                            onClick={() => setFilter("all")}
                        >
                            All
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "open" ? "default" : "outline"}
                            onClick={() => setFilter("open")}
                        >
                            Open ({openChatsCount})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "in_progress" ? "default" : "outline"}
                            onClick={() => setFilter("in_progress")}
                        >
                            In Progress ({inProgressCount})
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "resolved" ? "default" : "outline"}
                            onClick={() => setFilter("resolved")}
                        >
                            Resolved
                        </Button>
                        <Button
                            size="sm"
                            variant={filter === "closed" ? "default" : "outline"}
                            onClick={() => setFilter("closed")}
                        >
                            Closed
                        </Button>
                    </div>
                    <Button size="sm" variant="ghost" onClick={loadChats}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </GlassCard>

            {/* Chat List */}
            {loading ? (
                <GlassCard className="p-8 text-center">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                </GlassCard>
            ) : chats.length === 0 ? (
                <GlassCard className="p-12 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No support chats found</p>
                </GlassCard>
            ) : (
                <div className="space-y-3">
                    {chats.map((chat) => (
                        <GlassCard key={chat.id} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{chat.subject}</h4>
                                                {chat.unreadCount > 0 && (
                                                    <Badge variant="destructive" className="text-xs">
                                                        {chat.unreadCount} new
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {chat.user.name} ({chat.user.email})
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge className={getStatusColor(chat.status)}>
                                            {chat.status}
                                        </Badge>
                                        <Badge variant="outline" className={getPriorityColor(chat.priority)}>
                                            {chat.priority}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {chat._count.messages} messages
                                        </span>
                                    </div>

                                    {chat.messages.length > 0 && (
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                            {chat.messages[0].content}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Updated {new Date(chat.updatedAt).toLocaleString()}
                                        </div>
                                        {chat.admin && (
                                            <span>Assigned to {chat.admin.name}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 ml-4">
                                    <Button
                                        size="sm"
                                        onClick={() => setSelectedChatId(chat.id)}
                                    >
                                        View Chat
                                    </Button>
                                    {chat.status === "open" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusChange(chat.id, "in_progress")}
                                        >
                                            Start
                                        </Button>
                                    )}
                                    {chat.status === "in_progress" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusChange(chat.id, "resolved")}
                                        >
                                            Resolve
                                        </Button>
                                    )}
                                    {chat.status === "resolved" && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleStatusChange(chat.id, "closed")}
                                        >
                                            Close
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}

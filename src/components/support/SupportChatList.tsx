"use client";

import * as React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Clock } from "lucide-react";

interface Chat {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    unreadCount: number;
    messages: Array<{
        content: string;
        createdAt: string;
    }>;
    admin?: {
        name: string;
    };
}

interface SupportChatListProps {
    chats: Chat[];
    onSelectChat: (chatId: string) => void;
}

export function SupportChatList({ chats, onSelectChat }: SupportChatListProps) {
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
                return "text-red-600";
            case "high":
                return "text-orange-600";
            case "medium":
                return "text-yellow-600";
            case "low":
                return "text-green-600";
            default:
                return "text-gray-600";
        }
    };

    if (chats.length === 0) {
        return (
            <GlassCard className="p-12 text-center">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No support chats yet</p>
            </GlassCard>
        );
    }

    return (
        <div className="space-y-3">
            {chats.map((chat) => (
                <GlassCard
                    key={chat.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onSelectChat(chat.id)}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{chat.subject}</h4>
                                {chat.unreadCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                        {chat.unreadCount} new
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge className={getStatusColor(chat.status)}>
                                    {chat.status}
                                </Badge>
                                <span className={`text-xs font-medium ${getPriorityColor(chat.priority)}`}>
                                    {chat.priority} priority
                                </span>
                            </div>
                        </div>
                    </div>

                    {chat.messages.length > 0 && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {chat.messages[0].content}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(chat.updatedAt).toLocaleDateString()} at{" "}
                            {new Date(chat.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </div>
                        {chat.admin && (
                            <span>Assigned to {chat.admin.name}</span>
                        )}
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}

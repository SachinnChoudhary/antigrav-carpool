"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, X, ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    read: boolean;
    sender: {
        id: string;
        name: string;
        profileImage?: string;
        role: string;
    };
}

interface Chat {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
    messages: Message[];
    user: {
        id: string;
        name: string;
        email: string;
        profileImage?: string;
    };
    admin?: {
        id: string;
        name: string;
        profileImage?: string;
    };
}

interface SupportChatWindowProps {
    chatId: string;
    onClose: () => void;
}

export function SupportChatWindow({ chatId, onClose }: SupportChatWindowProps) {
    const [chat, setChat] = React.useState<Chat | null>(null);
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [newMessage, setNewMessage] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [sending, setSending] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const [userId, setUserId] = React.useState<string>("");

    React.useEffect(() => {
        const storedUserId = localStorage.getItem("userId") || "";
        setUserId(storedUserId);
        loadChat();
        markMessagesAsRead();

        // Poll for new messages every 3 seconds
        const interval = setInterval(() => {
            loadMessages();
        }, 3000);

        return () => clearInterval(interval);
    }, [chatId]);

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const loadChat = async () => {
        try {
            console.log("Loading chat:", chatId);
            const response = await fetch(`/api/support-chat/${chatId}`);
            console.log("Response status:", response.status);

            if (response.ok) {
                const data = await response.json();
                console.log("Chat data:", data);
                setChat(data.chat);
                setMessages(data.chat.messages);
            } else {
                const error = await response.json();
                console.error("API Error:", error);
                toast.error(error.error || "Failed to load chat");
            }
        } catch (error) {
            console.error("Network Error:", error);
            toast.error("Failed to load chat");
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async () => {
        try {
            const response = await fetch(`/api/support-chat/${chatId}/messages`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages);
            }
        } catch (error) {
            console.error("Failed to refresh messages");
        }
    };

    const markMessagesAsRead = async () => {
        try {
            await fetch(`/api/support-chat/${chatId}/messages`, {
                method: "PATCH",
            });
        } catch (error) {
            console.error("Failed to mark messages as read");
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            const response = await fetch(`/api/support-chat/${chatId}/messages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                setMessages([...messages, data.message]);
                setNewMessage("");
                markMessagesAsRead();
            } else {
                toast.error("Failed to send message");
            }
        } catch (error) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <GlassCard className="p-8 text-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </GlassCard>
        );
    }

    if (!chat) {
        return (
            <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">Chat not found</p>
            </GlassCard>
        );
    }

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

    return (
        <GlassCard className="flex flex-col h-[600px] max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h3 className="font-semibold">{chat.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={getStatusColor(chat.status)}>
                                {chat.status}
                            </Badge>
                            {chat.admin && (
                                <span className="text-xs text-muted-foreground">
                                    Assigned to {chat.admin.name}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => loadMessages()}
                    className="rounded-full"
                >
                    <RefreshCw className="h-4 w-4" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                    const isOwnMessage = message.senderId === userId;
                    const isAdmin = message.sender.role === "admin";

                    return (
                        <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwnMessage
                                    ? "bg-primary text-primary-foreground"
                                    : isAdmin
                                        ? "bg-purple-100 text-purple-900"
                                        : "bg-gray-100 text-gray-900"
                                    }`}
                            >
                                {!isOwnMessage && (
                                    <p className="text-xs font-semibold mb-1">
                                        {message.sender.name}
                                        {isAdmin && " (Support)"}
                                    </p>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p
                                    className={`text-xs mt-1 ${isOwnMessage
                                        ? "text-primary-foreground/70"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {new Date(message.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {chat.status !== "closed" && (
                <form onSubmit={handleSendMessage} className="p-4 border-t">
                    <div className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            disabled={sending}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={sending || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </form>
            )}
        </GlassCard>
    );
}

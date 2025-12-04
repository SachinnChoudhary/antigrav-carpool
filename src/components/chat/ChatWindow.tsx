"use client";

import * as React from "react";
import { GlassCard } from "../ui/glass-card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send, X } from "lucide-react";
import { initSocket, joinRoom, leaveRoom, sendMessage, onMessageReceived, emitTyping, onTyping } from "@/lib/socket";
import toast from "react-hot-toast";
import Image from "next/image";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        profileImage?: string;
    };
}

interface ChatWindowProps {
    bookingId: string;
    currentUserId: string;
    otherUser: {
        id: string;
        name: string;
        profileImage?: string;
    };
    variant?: 'modal' | 'embedded';
}

export function ChatWindow({ bookingId, currentUserId, otherUser, onClose, variant = 'modal' }: ChatWindowProps) {
    const [messages, setMessages] = React.useState<Message[]>([]);
    const [newMessage, setNewMessage] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [isTyping, setIsTyping] = React.useState(false);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);
    const typingTimeoutRef = React.useRef<NodeJS.Timeout>();

    React.useEffect(() => {
        // Initialize socket
        const socket = initSocket();

        // Join room
        joinRoom(bookingId);

        // Load message history
        loadMessages();

        // Listen for new messages
        onMessageReceived((message: Message) => {
            setMessages((prev) => [...prev, message]);
            scrollToBottom();
        });

        // Listen for typing
        onTyping((data) => {
            if (data.userId !== currentUserId) {
                setIsTyping(data.isTyping);
            }
        });

        return () => {
            leaveRoom(bookingId);
        };
    }, [bookingId, currentUserId]);

    const loadMessages = async () => {
        setLoading(true); // Reset loading state when bookingId changes
        try {
            const response = await fetch(`/api/messages?bookingId=${bookingId}`);
            const data = await response.json();

            if (response.ok) {
                setMessages(data.messages);
                scrollToBottom();

                // Mark messages as read
                await fetch('/api/messages', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId, userId: currentUserId }),
                });
            }
        } catch (error) {
            toast.error('Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSend = () => {
        if (!newMessage.trim()) return;

        sendMessage({
            bookingId,
            senderId: currentUserId,
            receiverId: otherUser.id,
            content: newMessage.trim(),
        });

        setNewMessage("");
        emitTyping(bookingId, currentUserId, false);
    };

    const handleTyping = (value: string) => {
        setNewMessage(value);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Emit typing
        emitTyping(bookingId, currentUserId, true);

        // Stop typing after 2 seconds
        typingTimeoutRef.current = setTimeout(() => {
            emitTyping(bookingId, currentUserId, false);
        }, 2000);
    };

    const content = (
        <div className={`flex flex-col h-full ${variant === 'modal' ? 'w-full max-w-2xl h-[600px]' : 'w-full'}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white/50 backdrop-blur-sm rounded-t-xl">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold overflow-hidden">
                        {otherUser.profileImage ? (
                            <Image src={otherUser.profileImage} alt={otherUser.name} width={40} height={40} className="object-cover" />
                        ) : (
                            otherUser.name[0]
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold">{otherUser.name}</h3>
                        {isTyping && <p className="text-xs text-muted-foreground">typing...</p>}
                    </div>
                </div>
                {onClose && (
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/30">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] rounded-lg p-3 ${message.senderId === currentUserId
                                    ? 'bg-primary text-white'
                                    : 'bg-white shadow-sm text-gray-900'
                                    }`}
                            >
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-[10px] mt-1 text-right ${message.senderId === currentUserId ? 'text-white/70' : 'text-gray-500'
                                    }`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-b-xl">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/80"
                    />
                    <Button onClick={handleSend} disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );

    if (variant === 'modal') {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <GlassCard className="p-0 overflow-hidden">
                    {content}
                </GlassCard>
            </div>
        );
    }

    return content;
}

"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Paperclip, Check, CheckCheck } from "lucide-react";

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    read: boolean;
}

interface ChatInterfaceProps {
    targetUser: {
        id: string;
        name: string;
        profileImage: string | null;
    };
}

export function ChatInterface({ targetUser }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [userId, setUserId] = useState<string>("");

    useEffect(() => {
        const storedUserId = localStorage.getItem("userId") || "ba37ca56-85f0-4f4d-9ca2-45386cd05e1d";
        setUserId(storedUserId);

        const fetchMessages = async () => {
            try {
                // Fetch messages between current user and target user
                // We'll use the existing /api/chats endpoint but filtered, or a new /api/messages endpoint
                // For now, let's assume we can fetch all messages for this conversation
                // Since /api/chats returns conversations, we might need a specific endpoint for messages in a conversation
                // Let's use /api/messages?userId=...&otherUserId=... (we need to implement this or modify existing)

                // Using the existing /api/messages endpoint which takes bookingId... wait, we modified it to take bookingId OR rideId.
                // But here we are chatting user-to-user. We need a general message fetch.
                // Let's create a new fetch logic here or update the API.
                // For this step, I'll mock the fetch or use a new endpoint pattern if I can't change the API easily.
                // Actually, I can update /api/messages to support fetching by sender/receiver pair.

                const res = await fetch(`/api/messages/conversation?userId=${storedUserId}&otherUserId=${targetUser.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data.messages);
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling for now
        return () => clearInterval(interval);
    }, [targetUser.id]);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!newMessage.trim()) return;

        const tempId = Date.now().toString();
        const messageContent = newMessage;
        setNewMessage("");

        // Optimistic update
        const optimisticMessage: Message = {
            id: tempId,
            content: messageContent,
            senderId: userId,
            createdAt: new Date().toISOString(),
            read: false,
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            const res = await fetch("/api/messages/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    senderId: userId,
                    receiverId: targetUser.id,
                    content: messageContent,
                }),
            });

            if (!res.ok) {
                console.error("Failed to send message");
                // Remove optimistic message or show error
            } else {
                const data = await res.json();
                // Replace optimistic message with real one
                setMessages((prev) => prev.map(m => m.id === tempId ? data.message : m));
            }
        } catch (error) {
            console.error("Error sending message", error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto bg-[#0b141a] bg-opacity-95" style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay" }}>
                {messages.length === 0 && (
                    <div className="flex justify-center items-center h-full text-gray-400 text-sm">
                        <div className="bg-[#1f2c34] px-4 py-2 rounded-lg shadow-sm">
                            Start a conversation with {targetUser.name}
                        </div>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === userId;
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`relative px-3 py-1.5 rounded-lg max-w-[80%] shadow-sm text-sm ${isMe
                                    ? "bg-[#005c4b] text-[#e9edef] rounded-tr-none"
                                    : "bg-[#202c33] text-[#e9edef] rounded-tl-none"
                                    }`}
                            >
                                <p className="leading-relaxed break-words pb-1">{msg.content}</p>
                                <div className="flex items-center justify-end space-x-1 -mt-1">
                                    <span className="text-[10px] text-white/60">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        msg.read ? <CheckCheck className="h-3 w-3 text-[#53bdeb]" /> : <Check className="h-3 w-3 text-white/60" />
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="sticky bottom-[72px] px-2 py-2 bg-[#202c33] flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-gray-400 hover:bg-transparent hover:text-gray-300">
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    placeholder="Type a message"
                    className="flex-1 bg-[#2a3942] border-none rounded-lg h-10 text-[#d1d7db] placeholder:text-gray-500 focus-visible:ring-0"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    size="icon"
                    className="rounded-full h-10 w-10 bg-[#00a884] hover:bg-[#008f6f] text-white shadow-none"
                    onClick={handleSend}
                    disabled={!newMessage.trim()}
                >
                    <Send className="h-5 w-5 ml-0.5" />
                </Button>
            </div>
        </>
    );
}

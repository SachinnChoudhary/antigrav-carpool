import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/support-chat - Get all support chats for the current user
export async function GET(req: NextRequest) {
    try {
        console.log("=== GET /api/support-chat ===");
        const token = req.cookies.get("token")?.value;
        console.log("Token exists:", !!token);

        if (!token) {
            console.log("No token found");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        console.log("Decoded token:", decoded);

        if (!decoded || !decoded.userId) {
            console.log("Invalid token or no userId");
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        console.log("Fetching chats for user:", decoded.userId);
        const chats = await prisma.supportChat.findMany({
            where: {
                userId: decoded.userId,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1, // Get last message for preview
                },
                admin: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                updatedAt: "desc",
            },
        });

        console.log("Found chats:", chats.length);

        // Count unread messages for each chat
        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await prisma.supportChatMessage.count({
                    where: {
                        chatId: chat.id,
                        senderId: { not: decoded.userId },
                        read: false,
                    },
                });
                return {
                    ...chat,
                    unreadCount,
                };
            })
        );

        return NextResponse.json({ chats: chatsWithUnread });
    } catch (error) {
        console.error("Error fetching support chats:", error);
        return NextResponse.json(
            { error: "Failed to fetch support chats" },
            { status: 500 }
        );
    }
}

// POST /api/support-chat - Create a new support chat
export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const { subject, message, priority } = await req.json();

        if (!subject || !message) {
            return NextResponse.json(
                { error: "Subject and message are required" },
                { status: 400 }
            );
        }

        // Create chat and first message in a transaction
        const chat = await prisma.supportChat.create({
            data: {
                userId: decoded.userId,
                subject,
                priority: priority || "medium",
                messages: {
                    create: {
                        senderId: decoded.userId,
                        content: message,
                    },
                },
            },
            include: {
                messages: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                    },
                },
            },
        });

        return NextResponse.json({ chat }, { status: 201 });
    } catch (error) {
        console.error("Error creating support chat:", error);
        return NextResponse.json(
            { error: "Failed to create support chat" },
            { status: 500 }
        );
    }
}

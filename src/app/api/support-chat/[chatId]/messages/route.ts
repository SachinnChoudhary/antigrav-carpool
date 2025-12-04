import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/support-chat/[chatId]/messages - Get all messages for a chat
export async function GET(
    req: NextRequest,
    { params }: { params: { chatId: string } }
) {
    try {
        console.log("=== GET messages for chat:", params.chatId);
        const token = req.cookies.get("token")?.value;
        if (!token) {
            console.log("No token");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        console.log("Decoded:", decoded);
        if (!decoded || !decoded.userId) {
            console.log("Invalid token");
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const chatId = params.chatId;
        console.log("Fetching chat:", chatId);

        // Verify access to chat
        const chat = await prisma.supportChat.findUnique({
            where: { id: chatId },
        });

        console.log("Chat found:", !!chat);

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        if (chat.userId !== decoded.userId && chat.adminId !== decoded.userId) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true },
            });

            if (user?.role !== "admin") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        console.log("Fetching messages...");
        const messages = await prisma.supportChatMessage.findMany({
            where: { chatId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        role: true,
                    },
                },
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages" },
            { status: 500 }
        );
    }
}

// POST /api/support-chat/[chatId]/messages - Send a new message
export async function POST(
    req: NextRequest,
    { params }: { params: { chatId: string } }
) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const chatId = params.chatId;
        const { content } = await req.json();

        if (!content || content.trim() === "") {
            return NextResponse.json(
                { error: "Message content is required" },
                { status: 400 }
            );
        }

        // Verify access to chat
        const chat = await prisma.supportChat.findUnique({
            where: { id: chatId },
        });

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        if (chat.userId !== decoded.userId && chat.adminId !== decoded.userId) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true },
            });

            if (user?.role !== "admin") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }

            // If admin is sending first message, assign them to the chat
            if (!chat.adminId && user?.role === "admin") {
                await prisma.supportChat.update({
                    where: { id: chatId },
                    data: {
                        adminId: decoded.userId,
                        status: "in_progress",
                    },
                });
            }
        }

        const message = await prisma.supportChatMessage.create({
            data: {
                chatId,
                senderId: decoded.userId,
                content: content.trim(),
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                        role: true,
                    },
                },
            },
        });

        // Update chat's updatedAt timestamp
        await prisma.supportChat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
        });

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error("Error sending message:", error);
        return NextResponse.json(
            { error: "Failed to send message" },
            { status: 500 }
        );
    }
}

// PATCH /api/support-chat/[chatId]/messages - Mark messages as read
export async function PATCH(
    req: NextRequest,
    { params }: { params: { chatId: string } }
) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        const chatId = params.chatId;

        // Mark all messages in this chat as read (except user's own messages)
        await prisma.supportChatMessage.updateMany({
            where: {
                chatId,
                senderId: { not: decoded.userId },
                read: false,
            },
            data: {
                read: true,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        return NextResponse.json(
            { error: "Failed to mark messages as read" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/admin/support-chats - Get all support chats for admin
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const whereClause: any = {};
        if (status && status !== "all") {
            whereClause.status = status;
        }

        const chats = await prisma.supportChat.findMany({
            where: whereClause,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                    },
                },
                admin: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    },
                },
                messages: {
                    orderBy: {
                        createdAt: "desc",
                    },
                    take: 1,
                },
                _count: {
                    select: {
                        messages: true,
                    },
                },
            },
            orderBy: [
                { status: "asc" }, // Open chats first
                { updatedAt: "desc" },
            ],
        });

        // Count unread messages for each chat
        const chatsWithUnread = await Promise.all(
            chats.map(async (chat) => {
                const unreadCount = await prisma.supportChatMessage.count({
                    where: {
                        chatId: chat.id,
                        senderId: chat.userId, // Messages from user (not admin)
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

// PATCH /api/admin/support-chats - Update chat (assign admin, change status)
export async function PATCH(req: NextRequest) {
    try {
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { chatId, status, priority, adminId } = await req.json();

        if (!chatId) {
            return NextResponse.json(
                { error: "Chat ID is required" },
                { status: 400 }
            );
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;
        if (adminId !== undefined) updateData.adminId = adminId;

        const updatedChat = await prisma.supportChat.update({
            where: { id: chatId },
            data: updateData,
        });

        return NextResponse.json({ chat: updatedChat });
    } catch (error) {
        console.error("Error updating chat:", error);
        return NextResponse.json(
            { error: "Failed to update chat" },
            { status: 500 }
        );
    }
}

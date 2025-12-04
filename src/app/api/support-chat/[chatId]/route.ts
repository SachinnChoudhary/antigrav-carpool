import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

// GET /api/support-chat/[chatId] - Get chat details and messages
export async function GET(
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

        const chat = await prisma.supportChat.findUnique({
            where: { id: chatId },
            include: {
                messages: {
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
                },
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
            },
        });

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Verify user has access to this chat
        const isOwner = chat.userId === decoded.userId;
        const isAssignedAdmin = chat.adminId && chat.adminId === decoded.userId;

        if (!isOwner && !isAssignedAdmin) {
            // Check if user is admin (can view any chat)
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { role: true },
            });

            if (user?.role !== "admin") {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        return NextResponse.json({ chat });
    } catch (error) {
        console.error("Error fetching chat:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat" },
            { status: 500 }
        );
    }
}

// PATCH /api/support-chat/[chatId] - Update chat status
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
        const { status, priority } = await req.json();

        const chat = await prisma.supportChat.findUnique({
            where: { id: chatId },
        });

        if (!chat) {
            return NextResponse.json({ error: "Chat not found" }, { status: 404 });
        }

        // Only chat owner or admin can update
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true },
        });

        if (chat.userId !== decoded.userId && user?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (priority) updateData.priority = priority;

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

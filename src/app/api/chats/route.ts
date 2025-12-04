import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/chats?userId=xxx
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        // Fetch all messages where the user is sender or receiver
        // We need to group them by the OTHER user to form "conversations"
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'desc' },
            include: {
                sender: {
                    select: { id: true, name: true, profileImage: true }
                },
                receiver: {
                    select: { id: true, name: true, profileImage: true }
                }
            }
        });

        // Group by conversation partner
        const conversationsMap = new Map();

        for (const msg of messages) {
            const isSender = msg.senderId === userId;
            const partner = isSender ? msg.receiver : msg.sender;

            if (!conversationsMap.has(partner.id)) {
                conversationsMap.set(partner.id, {
                    user: partner,
                    lastMessage: msg.content,
                    timestamp: msg.createdAt,
                    unreadCount: (!isSender && !msg.read) ? 1 : 0
                });
            } else {
                const conv = conversationsMap.get(partner.id);
                if (!isSender && !msg.read) {
                    conv.unreadCount += 1;
                }
            }
        }

        const conversations = Array.from(conversationsMap.values());

        return NextResponse.json({ conversations }, { status: 200 });
    } catch (error) {
        console.error('Get chats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch chats' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/messages/conversation?userId=xxx&otherUserId=yyy
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const otherUserId = searchParams.get('otherUserId');

        if (!userId || !otherUserId) {
            return NextResponse.json(
                { error: 'User IDs are required' },
                { status: 400 }
            );
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId }
                ]
            },
            orderBy: { createdAt: 'asc' }
        });

        return NextResponse.json({ messages }, { status: 200 });
    } catch (error) {
        console.error('Get conversation error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

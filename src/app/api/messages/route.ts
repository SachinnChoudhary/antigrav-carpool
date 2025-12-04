import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/messages?bookingId=xxx
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const bookingId = searchParams.get('bookingId');

        if (!bookingId) {
            return NextResponse.json(
                { error: 'Booking ID is required' },
                { status: 400 }
            );
        }

        const messages = await prisma.message.findMany({
            where: { bookingId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({ messages }, { status: 200 });
    } catch (error) {
        console.error('Get messages error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

// PATCH /api/messages - Mark messages as read
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId, userId } = body;

        if (!bookingId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        await prisma.message.updateMany({
            where: {
                bookingId,
                receiverId: userId,
                read: false,
            },
            data: { read: true },
        });

        return NextResponse.json(
            { message: 'Messages marked as read' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Mark messages read error:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/messages/send
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { senderId, receiverId, content } = body;

        if (!senderId || !receiverId || !content) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const message = await prisma.message.create({
            data: {
                senderId,
                receiverId,
                content,
                read: false
            }
        });

        return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
        console.error('Send message error:', error);
        return NextResponse.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}

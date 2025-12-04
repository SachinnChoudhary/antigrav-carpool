// src/app/api/profile/[userId]/friendships/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all friendships for a user (both requested and received)
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [{ requesterId: userId }, { addresseeId: userId }],
        },
        select: {
            id: true,
            requesterId: true,
            addresseeId: true,
            status: true,
            createdAt: true,
        },
    });
    return NextResponse.json(friendships);
}

// POST a new friendship request (expects { addresseeId })
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const { addresseeId } = await request.json();
    const existing = await prisma.friendship.findFirst({
        where: {
            OR: [
                { requesterId: userId, addresseeId },
                { requesterId: addresseeId, addresseeId: userId },
            ],
        },
    });
    if (existing) return NextResponse.json({ error: 'Friendship already exists' }, { status: 400 });
    const created = await prisma.friendship.create({
        data: { requesterId: userId, addresseeId, status: 'pending' },
    });
    return NextResponse.json(created);
}

// PUT to update status (accept or reject) (expects { id, status })
export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { id, status } = await request.json();
    if (!['accepted', 'rejected'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const updated = await prisma.friendship.update({
        where: { id },
        data: { status },
    });
    return NextResponse.json(updated);
}

// DELETE a friendship (expects { id })
export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { id } = await request.json();
    const deleted = await prisma.friendship.delete({ where: { id } });
    return NextResponse.json(deleted);
}

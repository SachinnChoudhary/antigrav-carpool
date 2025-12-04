// src/app/api/profile/[userId]/preferences/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET preferences and interests
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { preferences: true, interests: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
}

// PUT to update preferences and interests (expects { preferences?, interests? })
export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const data = await request.json();
    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            preferences: data.preferences,
            interests: data.interests,
        },
    });
    return NextResponse.json(updated);
}

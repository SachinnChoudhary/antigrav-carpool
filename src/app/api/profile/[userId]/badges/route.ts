// src/app/api/profile/[userId]/badges/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all badges for a user
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const badges = await prisma.userBadge.findMany({
        where: { userId },
        select: { id: true, badgeName: true, description: true, earnedAt: true },
    });
    return NextResponse.json(badges);
}

// POST a new badge (expects { badgeName, description })
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const { badgeName, description } = await request.json();
    const created = await prisma.userBadge.create({
        data: { userId, badgeName, description },
    });
    return NextResponse.json(created);
}

// DELETE a badge by id (expects { id } in body)
export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { id } = await request.json();
    const deleted = await prisma.userBadge.delete({
        where: { id },
    });
    return NextResponse.json(deleted);
}

// src/app/api/profile/[userId]/social-profiles/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all social profiles for a user
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const profiles = await prisma.socialProfile.findMany({
        where: { userId },
        select: { id: true, provider: true, profileUrl: true, createdAt: true },
    });
    return NextResponse.json(profiles);
}

// POST a new social profile (expects { provider, profileUrl })
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const { provider, profileUrl } = await request.json();
    const created = await prisma.socialProfile.create({
        data: { userId, provider, profileUrl },
    });
    return NextResponse.json(created);
}

// DELETE a social profile by id (expects { id } in body)
export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { id } = await request.json();
    const deleted = await prisma.socialProfile.delete({
        where: { id },
    });
    return NextResponse.json(deleted);
}

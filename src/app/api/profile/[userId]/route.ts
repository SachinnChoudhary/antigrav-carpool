// src/app/api/profile/[userId]/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            profileImage: true,
            bio: true,
            rating: true,
            totalRides: true,
            verified: true,
            dateOfBirth: true,
            gender: true,
            address: true,
            preferences: true,
            interests: true,
            idDocumentUrl: true,
            driverLicenseUrl: true,
            idVerified: true,
            driverLicenseVerified: true,
            socialProfiles: true,
            userBadges: true,
            friendshipsRequested: true,
            friendshipsReceived: true,
        },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json(user);
}

export async function PUT(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const data = await request.json();
    const updated = await prisma.user.update({
        where: { id: userId },
        data,
    });
    return NextResponse.json(updated);
}

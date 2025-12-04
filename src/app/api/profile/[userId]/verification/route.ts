// src/app/api/profile/[userId]/verification/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const data = await request.json();

    // Build update object with only provided fields
    const updateData: any = {};

    if (data.idDocumentUrl !== undefined) {
        updateData.idDocumentUrl = data.idDocumentUrl;
        updateData.idVerified = false; // Reset verification when new document uploaded
    }

    if (data.idType !== undefined) {
        updateData.idType = data.idType;
    }

    if (data.idNumber !== undefined) {
        updateData.idNumber = data.idNumber;
    }

    if (data.driverLicenseUrl !== undefined) {
        updateData.driverLicenseUrl = data.driverLicenseUrl;
        updateData.driverLicenseVerified = false; // Reset verification when new document uploaded
    }

    if (data.idVerified !== undefined) {
        updateData.idVerified = data.idVerified;
    }

    if (data.driverLicenseVerified !== undefined) {
        updateData.driverLicenseVerified = data.driverLicenseVerified;
    }

    try {
        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Verification update error:', error);
        return NextResponse.json({ error: 'Failed to update verification status', details: String(error) }, { status: 500 });
    }
}

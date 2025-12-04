import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: userId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const data = await request.json();
    const { verificationType, approved } = data; // verificationType: 'id' or 'driverLicense'

    try {
        const updateData: any = {};

        if (verificationType === 'id') {
            updateData.idVerified = approved;
        } else if (verificationType === 'driverLicense') {
            updateData.driverLicenseVerified = approved;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Verification approval error:', error);
        return NextResponse.json({ error: 'Failed to update verification status' }, { status: 500 });
    }
}

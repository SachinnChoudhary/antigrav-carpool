import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    try {
        const { type } = await request.json();
        const { id: userId } = await params;

        if (!type || !['id', 'license'].includes(type)) {
            return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 });
        }

        // Unverify based on type
        if (type === 'id') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    idVerified: false,
                    idDocumentUrl: null,
                },
            });
        } else if (type === 'license') {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    driverLicenseVerified: false,
                    driverLicenseUrl: null,
                },
            });
        }

        // TODO: Send notification to user about re-upload requirement
        // You can integrate with the notification system here

        return NextResponse.json({
            success: true,
            message: `${type === 'id' ? 'ID' : 'License'} verification revoked successfully`,
        });
    } catch (error) {
        console.error('Failed to unverify user:', error);
        return NextResponse.json({ error: 'Failed to unverify user' }, { status: 500 });
    }
}

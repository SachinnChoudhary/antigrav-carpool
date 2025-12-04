import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET() {
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
        // Find users with pending verifications
        const verificationRequests = await prisma.user.findMany({
            where: {
                OR: [
                    {
                        AND: [
                            { idDocumentUrl: { not: null } },
                            { idVerified: false }
                        ]
                    },
                    {
                        // Driver license uploaded but not verified
                        AND: [
                            { driverLicenseUrl: { not: null } },
                            { driverLicenseVerified: false }
                        ]
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                idDocumentUrl: true,
                idType: true,
                idNumber: true,
                idVerified: true,
                driverLicenseUrl: true,
                driverLicenseNumber: true,
                driverLicenseVerified: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ verificationRequests });
    } catch (error) {
        console.error('Failed to fetch verification requests:', error);
        return NextResponse.json(
            { error: 'Failed to fetch verification requests' },
            { status: 500 }
        );
    }
}

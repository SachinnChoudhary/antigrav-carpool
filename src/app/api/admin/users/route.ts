import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
    const authCheck = await requireAdmin(request);

    if ('error' in authCheck) {
        return NextResponse.json(
            { error: authCheck.error },
            { status: authCheck.status }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const skip = (page - 1) * limit;

        // Define a 'where' clause based on search parameters if needed, otherwise it's empty
        const where: any = {};
        const verifiedStatus = searchParams.get('verified');
        if (verifiedStatus === 'true') {
            where.verified = true;
        } else if (verifiedStatus === 'false') {
            where.verified = false;
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    bio: true,
                    role: true,
                    verified: true,
                    idVerified: true,
                    idType: true,
                    idNumber: true,
                    idDocumentUrl: true,
                    driverLicenseVerified: true,
                    driverLicenseNumber: true,
                    driverLicenseUrl: true,
                    suspended: true,
                    suspendedAt: true,
                    suspensionReason: true,
                    createdAt: true,
                    totalRides: true,
                    rating: true,
                    profileImage: true,
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where }), // Count with the same 'where' clause
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        );
    }
}

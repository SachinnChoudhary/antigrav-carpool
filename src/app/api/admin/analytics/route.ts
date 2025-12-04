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
        // Get analytics data
        const [
            totalUsers,
            totalRides,
            totalBookings,
            totalPayments,
            recentUsers,
            recentRides,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.ride.count(),
            prisma.booking.count(),
            prisma.payment.aggregate({
                _sum: { amount: true },
                _count: true,
            }),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                    },
                },
            }),
            prisma.ride.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                },
            }),
        ]);

        const activeRides = await prisma.ride.count({
            where: { status: 'active' },
        });

        const completedRides = await prisma.ride.count({
            where: { status: 'completed' },
        });

        return NextResponse.json({
            totalUsers,
            totalRides,
            totalBookings,
            totalRevenue: totalPayments._sum.amount || 0,
            totalPayments: totalPayments._count,
            recentUsers,
            recentRides,
            activeRides,
            completedRides,
        });
    } catch (error) {
        console.error('Failed to fetch analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// GET /api/admin/stats - Get dashboard statistics
export async function GET(request: NextRequest) {
    const authCheck = await requireAdmin(request);

    if ('error' in authCheck) {
        return NextResponse.json(
            { error: authCheck.error },
            { status: authCheck.status }
        );
    }

    try {
        const [
            totalUsers,
            totalRides,
            totalBookings,
            totalRevenue,
            usersByRole,
            suspendedUsers,
            recentUsers,
            topDrivers,
        ] = await Promise.all([
            // Total users
            prisma.user.count(),

            // Total rides
            prisma.ride.count(),

            // Total bookings
            prisma.booking.count(),

            // Total revenue (sum of all payments)
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: 'succeeded' },
            }),

            // Users by role
            prisma.user.groupBy({
                by: ['role'],
                _count: true,
            }),

            // Suspended users
            prisma.user.count({
                where: { suspended: true },
            }),

            // Recent users (last 7 days)
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                    },
                },
            }),

            // Top drivers by rating
            prisma.user.findMany({
                where: { role: 'driver' },
                orderBy: { rating: 'desc' },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    rating: true,
                    totalRides: true,
                },
            }),
        ]);

        return NextResponse.json({
            overview: {
                totalUsers,
                totalRides,
                totalBookings,
                totalRevenue: totalRevenue._sum.amount || 0,
                suspendedUsers,
                recentUsers,
            },
            usersByRole: usersByRole.reduce((acc, item) => {
                acc[item.role] = item._count;
                return acc;
            }, {} as Record<string, number>),
            topDrivers,
        });
    } catch (error) {
        console.error('Get stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}

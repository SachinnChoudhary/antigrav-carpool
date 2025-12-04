import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
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
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get('timeRange') || 'month';

        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        let groupBy: 'day' | 'week' | 'month' = 'day';

        switch (timeRange) {
            case 'day':
                startDate.setDate(now.getDate() - 1);
                groupBy = 'day';
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                groupBy = 'day';
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                groupBy = 'day';
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                groupBy = 'month';
                break;
        }

        // Revenue trends
        const payments = await prisma.payment.findMany({
            where: {
                createdAt: { gte: startDate },
                status: { in: ['completed', 'partially_refunded', 'refunded'] },
            },
            select: {
                amount: true,
                refundAmount: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        const revenueByDate: { [key: string]: number } = {};
        payments.forEach((payment) => {
            const date = payment.createdAt.toISOString().split('T')[0];
            const netAmount = payment.amount - (payment.refundAmount || 0);
            revenueByDate[date] = (revenueByDate[date] || 0) + netAmount;
        });

        const revenueData = Object.entries(revenueByDate).map(([date, revenue]) => ({
            date,
            revenue: Math.round(revenue * 100) / 100,
        }));

        // User growth
        const users = await prisma.user.findMany({
            where: {
                createdAt: { gte: startDate },
            },
            select: {
                createdAt: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        const usersByDate: { [key: string]: number } = {};
        users.forEach((user) => {
            const date = user.createdAt.toISOString().split('T')[0];
            usersByDate[date] = (usersByDate[date] || 0) + 1;
        });

        // Calculate cumulative users
        let cumulative = 0;
        const userGrowthData = Object.entries(usersByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => {
                cumulative += count;
                return { date, users: cumulative, newUsers: count };
            });

        // Ride statistics
        const rideStats = await prisma.ride.groupBy({
            by: ['status'],
            _count: true,
            where: {
                createdAt: { gte: startDate },
            },
        });

        const rideStatsData = rideStats.map((stat) => ({
            status: stat.status,
            count: stat._count,
        }));

        // Payment status distribution
        const paymentStats = await prisma.payment.groupBy({
            by: ['status'],
            _count: true,
            where: {
                createdAt: { gte: startDate },
            },
        });

        const paymentDistribution = paymentStats.map((stat) => ({
            name: stat.status,
            value: stat._count,
        }));

        // Booking trends
        const bookings = await prisma.booking.findMany({
            where: {
                createdAt: { gte: startDate },
            },
            select: {
                createdAt: true,
                status: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        const bookingsByDate: { [key: string]: number } = {};
        bookings.forEach((booking) => {
            const date = booking.createdAt.toISOString().split('T')[0];
            bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
        });

        const bookingTrendsData = Object.entries(bookingsByDate).map(([date, count]) => ({
            date,
            bookings: count,
        }));

        // Calculate trends (compare with previous period)
        const previousStartDate = new Date(startDate);
        previousStartDate.setTime(startDate.getTime() - (now.getTime() - startDate.getTime()));

        const previousRevenue = await prisma.payment.aggregate({
            where: {
                createdAt: { gte: previousStartDate, lt: startDate },
                status: { in: ['completed', 'partially_refunded', 'refunded'] },
            },
            _sum: { amount: true },
        });

        const currentRevenue = await prisma.payment.aggregate({
            where: {
                createdAt: { gte: startDate },
                status: { in: ['completed', 'partially_refunded', 'refunded'] },
            },
            _sum: { amount: true },
        });

        const previousUsers = await prisma.user.count({
            where: {
                createdAt: { gte: previousStartDate, lt: startDate },
            },
        });

        const currentUsers = await prisma.user.count({
            where: {
                createdAt: { gte: startDate },
            },
        });

        const revenueTrend = previousRevenue._sum.amount
            ? ((((currentRevenue._sum.amount || 0) - previousRevenue._sum.amount) / previousRevenue._sum.amount) * 100)
            : 100;

        const userTrend = previousUsers
            ? (((currentUsers - previousUsers) / previousUsers) * 100)
            : 100;

        return NextResponse.json({
            revenueData,
            userGrowthData,
            rideStatsData,
            paymentDistribution,
            bookingTrendsData,
            trends: {
                revenue: Math.round(revenueTrend * 100) / 100,
                users: Math.round(userTrend * 100) / 100,
            },
            summary: {
                totalRevenue: currentRevenue._sum.amount || 0,
                newUsers: currentUsers,
                totalRides: rideStats.reduce((sum, stat) => sum + stat._count, 0),
                totalBookings: bookings.length,
            },
        });
    } catch (error) {
        console.error('Failed to fetch advanced analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

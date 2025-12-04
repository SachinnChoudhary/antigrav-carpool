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
        // Get all payments
        const allPayments = await prisma.payment.findMany();

        // Calculate analytics
        const totalRevenue = allPayments
            .filter((p) => p.status === 'completed' || p.status === 'partially_refunded' || p.status === 'refunded')
            .reduce((sum, p) => sum + p.amount, 0);

        const totalRefunds = allPayments.reduce((sum, p) => sum + (p.refundAmount || 0), 0);

        const completedPayments = allPayments.filter((p) => p.status === 'completed' || p.status === 'partially_refunded' || p.status === 'refunded');
        const failedPayments = allPayments.filter((p) => p.status === 'failed');

        const successRate = allPayments.length > 0
            ? (completedPayments.length / allPayments.length) * 100
            : 0;

        const averageTransaction = completedPayments.length > 0
            ? totalRevenue / completedPayments.length
            : 0;

        // Get monthly revenue for last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentPayments = await prisma.payment.findMany({
            where: {
                createdAt: {
                    gte: sixMonthsAgo,
                },
                status: {
                    in: ['completed', 'partially_refunded', 'refunded'],
                },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Group by month
        const monthlyRevenue: { [key: string]: number } = {};
        recentPayments.forEach((payment) => {
            const month = payment.createdAt.toISOString().slice(0, 7); // YYYY-MM
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amount;
        });

        // Get top earners (receivers with most earnings)
        const earningsByUser = await prisma.payment.groupBy({
            by: ['receiverId'],
            where: {
                status: {
                    in: ['completed', 'partially_refunded', 'refunded'],
                },
            },
            _sum: {
                amount: true,
            },
            orderBy: {
                _sum: {
                    amount: 'desc',
                },
            },
            take: 5,
        });

        const topEarners = await Promise.all(
            earningsByUser.map(async (earning) => {
                const user = await prisma.user.findUnique({
                    where: { id: earning.receiverId },
                    select: { id: true, name: true, email: true },
                });
                return {
                    user,
                    totalEarnings: earning._sum.amount || 0,
                };
            })
        );

        return NextResponse.json({
            totalRevenue,
            totalRefunds,
            netRevenue: totalRevenue - totalRefunds,
            totalPayments: allPayments.length,
            completedPayments: completedPayments.length,
            failedPayments: failedPayments.length,
            successRate: successRate.toFixed(2),
            averageTransaction: averageTransaction.toFixed(2),
            monthlyRevenue,
            topEarners,
        });
    } catch (error) {
        console.error('Failed to fetch payment analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}

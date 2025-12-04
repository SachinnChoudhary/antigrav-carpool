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
        const totalLogs = await prisma.activityLog.count();

        // Today's logs
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayLogs = await prisma.activityLog.count({
            where: {
                createdAt: {
                    gte: todayStart,
                },
            },
        });

        // By type
        const byType = await prisma.activityLog.groupBy({
            by: ['actionType'],
            _count: true,
            orderBy: {
                _count: {
                    actionType: 'desc',
                },
            },
            take: 10,
        });

        // By status
        const byStatus = await prisma.activityLog.groupBy({
            by: ['status'],
            _count: true,
        });

        // Top users
        const topUsers = await prisma.activityLog.groupBy({
            by: ['userId'],
            _count: true,
            where: {
                userId: {
                    not: null,
                },
            },
            orderBy: {
                _count: {
                    userId: 'desc',
                },
            },
            take: 10,
        });

        const topUsersWithDetails = await Promise.all(
            topUsers.map(async (item) => {
                const user = await prisma.user.findUnique({
                    where: { id: item.userId! },
                    select: { id: true, name: true, email: true },
                });
                return {
                    user,
                    count: item._count,
                };
            })
        );

        // Recent activity
        const recentActivity = await prisma.activityLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Failed actions
        const failedActions = await prisma.activityLog.count({
            where: { status: 'failure' },
        });

        return NextResponse.json({
            totalLogs,
            todayLogs,
            byType: byType.map((item) => ({
                type: item.actionType,
                count: item._count,
            })),
            byStatus: byStatus.map((item) => ({
                status: item.status,
                count: item._count,
            })),
            topUsers: topUsersWithDetails,
            recentActivity,
            failedActions,
        });
    } catch (error) {
        console.error('Failed to fetch activity stats:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}

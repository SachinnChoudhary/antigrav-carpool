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
        const [
            totalNotifications,
            totalAnnouncements,
            totalMessages,
            unreadMessages,
            activeAnnouncements,
        ] = await Promise.all([
            prisma.notification.count(),
            prisma.announcement.count(),
            prisma.adminMessage.count(),
            prisma.adminMessage.count({ where: { read: false } }),
            prisma.announcement.count({ where: { active: true } }),
        ]);

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentNotifications = await prisma.notification.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
        });

        const recentAnnouncements = await prisma.announcement.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
        });

        const recentMessages = await prisma.adminMessage.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
        });

        return NextResponse.json({
            totalNotifications,
            totalAnnouncements,
            totalMessages,
            unreadMessages,
            activeAnnouncements,
            recentActivity: {
                notifications: recentNotifications,
                announcements: recentAnnouncements,
                messages: recentMessages,
            },
        });
    } catch (error) {
        console.error('Failed to fetch communication stats:', error);
        return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }
}

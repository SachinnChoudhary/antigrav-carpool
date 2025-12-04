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
        const actionType = searchParams.get('actionType');
        const actorType = searchParams.get('actorType');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = {};

        if (actionType && actionType !== 'all') {
            where.actionType = actionType;
        }

        if (actorType && actorType !== 'all') {
            where.actorType = actorType;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        const logs = await prisma.activityLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Generate CSV
        const headers = [
            'ID',
            'Date/Time',
            'Actor Type',
            'User Name',
            'User Email',
            'Action Type',
            'Target Type',
            'Target ID',
            'Description',
            'Status',
            'IP Address',
        ];

        const rows = logs.map((log) => [
            log.id,
            log.createdAt.toISOString(),
            log.actorType,
            log.user?.name || 'System',
            log.user?.email || 'N/A',
            log.actionType,
            log.targetType || 'N/A',
            log.targetId || 'N/A',
            log.description,
            log.status,
            log.ipAddress || 'N/A',
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="activity-logs-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Failed to export activity logs:', error);
        return NextResponse.json({ error: 'Failed to export logs' }, { status: 500 });
    }
}

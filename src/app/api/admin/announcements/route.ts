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
        const active = searchParams.get('active');
        const priority = searchParams.get('priority');

        const where: any = {};

        if (active !== null && active !== 'all') {
            where.active = active === 'true';
        }

        if (priority && priority !== 'all') {
            where.priority = priority;
        }

        const announcements = await prisma.announcement.findMany({
            where,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        dismissals: true,
                    },
                },
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        return NextResponse.json({ announcements });
    } catch (error) {
        console.error('Failed to fetch announcements:', error);
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }
}

export async function POST(request: Request) {
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
        const { title, content, priority, type, dismissible, scheduledFor, expiresAt } = await request.json();

        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                priority: priority || 'medium',
                type: type || 'info',
                dismissible: dismissible !== false,
                scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy: decoded.userId,
            },
        });

        return NextResponse.json({
            message: 'Announcement created successfully',
            announcement,
        });
    } catch (error) {
        console.error('Failed to create announcement:', error);
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }
}

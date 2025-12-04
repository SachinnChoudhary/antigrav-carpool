import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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
        const data = await request.json();

        const announcement = await prisma.announcement.update({
            where: { id },
            data: {
                ...data,
                scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
                expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            },
        });

        return NextResponse.json({
            message: 'Announcement updated successfully',
            announcement,
        });
    } catch (error) {
        console.error('Failed to update announcement:', error);
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
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
        await prisma.announcement.delete({
            where: { id },
        });

        return NextResponse.json({
            message: 'Announcement deleted successfully',
        });
    } catch (error) {
        console.error('Failed to delete announcement:', error);
        return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }
}

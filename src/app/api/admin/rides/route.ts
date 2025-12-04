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
        const status = searchParams.get('status');

        const where: any = {};
        if (status && status !== 'all') {
            where.status = status;
        }

        const rides = await prisma.ride.findMany({
            where,
            include: {
                driver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        profileImage: true,
                    },
                },
                bookings: {
                    include: {
                        passenger: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json(rides);
    } catch (error) {
        console.error('Failed to fetch rides:', error);
        return NextResponse.json({ error: 'Failed to fetch rides' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
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
        const { rideId, status } = await request.json();

        const updatedRide = await prisma.ride.update({
            where: { id: rideId },
            data: { status },
        });

        return NextResponse.json(updatedRide);
    } catch (error) {
        console.error('Failed to update ride:', error);
        return NextResponse.json({ error: 'Failed to update ride' }, { status: 500 });
    }
}

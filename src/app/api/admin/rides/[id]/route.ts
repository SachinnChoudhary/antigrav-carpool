import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: rideId } = await params;
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

        const updatedRide = await prisma.ride.update({
            where: { id: rideId },
            data: {
                from: data.from,
                to: data.to,
                date: new Date(data.date),
                time: data.time,
                seats: data.seats,
                price: data.price,
                status: data.status,
            },
        });

        return NextResponse.json(updatedRide);
    } catch (error) {
        console.error('Failed to update ride:', error);
        return NextResponse.json({ error: 'Failed to update ride' }, { status: 500 });
    }
}

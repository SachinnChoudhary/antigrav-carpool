import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH /api/bookings/[id] - Update booking status
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        const booking = await prisma.booking.update({
            where: { id: params.id },
            data: { status },
            include: {
                ride: true,
                passenger: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // If cancelled, restore seats to the ride
        if (status === 'cancelled') {
            await prisma.ride.update({
                where: { id: booking.rideId },
                data: {
                    seats: {
                        increment: booking.seats
                    }
                }
            });
        }

        return NextResponse.json(
            { message: 'Booking updated successfully', booking },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update booking error:', error);
        return NextResponse.json(
            { error: 'Failed to update booking' },
            { status: 500 }
        );
    }
}

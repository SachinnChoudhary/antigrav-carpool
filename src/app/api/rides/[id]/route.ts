import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rides/[id] - Get a specific ride
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const ride = await prisma.ride.findUnique({
            where: { id: params.id },
            include: {
                driver: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        rating: true,
                        totalRides: true,
                        verified: true
                    }
                },
                bookings: {
                    include: {
                        passenger: {
                            select: {
                                id: true,
                                name: true,
                                rating: true
                            }
                        }
                    }
                },
                reviews: {
                    include: {
                        reviewer: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!ride) {
            return NextResponse.json(
                { error: 'Ride not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ ride }, { status: 200 });
    } catch (error) {
        console.error('Get ride error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ride' },
            { status: 500 }
        );
    }
}

// PATCH /api/rides/[id] - Update a ride
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { status, seats } = body;

        const updateData: any = {};
        if (status) updateData.status = status;
        if (seats !== undefined) updateData.seats = parseInt(seats);

        const ride = await prisma.ride.update({
            where: { id: params.id },
            data: updateData
        });

        return NextResponse.json(
            { message: 'Ride updated successfully', ride },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update ride error:', error);
        return NextResponse.json(
            { error: 'Failed to update ride' },
            { status: 500 }
        );
    }
}

// DELETE /api/rides/[id] - Delete a ride
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.ride.delete({
            where: { id: params.id }
        });

        return NextResponse.json(
            { message: 'Ride deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Delete ride error:', error);
        return NextResponse.json(
            { error: 'Failed to delete ride' },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/bookings - List bookings for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const type = searchParams.get('type'); // 'passenger' or 'driver'

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        let bookings;

        if (type === 'driver') {
            // Get bookings for rides created by this driver
            bookings = await prisma.booking.findMany({
                where: {
                    ride: {
                        driverId: userId
                    }
                },
                include: {
                    ride: true,
                    passenger: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            rating: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Get bookings made by this passenger
            bookings = await prisma.booking.findMany({
                where: { passengerId: userId },
                include: {
                    ride: {
                        include: {
                            driver: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                    phone: true,
                                    rating: true,
                                    verified: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
        }

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rideId, passengerId, seats } = body;

        if (!rideId || !passengerId || !seats) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Check if ride exists and has enough seats
        const ride = await prisma.ride.findUnique({
            where: { id: rideId }
        });

        if (!ride) {
            return NextResponse.json(
                { error: 'Ride not found' },
                { status: 404 }
            );
        }

        if (ride.seats < parseInt(seats)) {
            return NextResponse.json(
                { error: 'Not enough seats available' },
                { status: 400 }
            );
        }

        // Create booking and update ride seats
        const booking = await prisma.booking.create({
            data: {
                rideId,
                passengerId,
                seats: parseInt(seats),
                status: 'confirmed'
            },
            include: {
                ride: {
                    include: {
                        driver: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true
                            }
                        }
                    }
                },
                passenger: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // Update available seats
        await prisma.ride.update({
            where: { id: rideId },
            data: { seats: ride.seats - parseInt(seats) }
        });

        return NextResponse.json(
            { message: 'Booking created successfully', booking },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create booking error:', error);
        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        );
    }
}

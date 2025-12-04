import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/rides - List all rides or search
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const date = searchParams.get('date');

        const where: any = { status: 'active' };

        if (from) {
            where.OR = [
                { from: { contains: from } },
                { fromDetail: { contains: from } }
            ];
        }

        if (to) {
            where.AND = [
                ...(where.AND || []),
                {
                    OR: [
                        { to: { contains: to } },
                        { toDetail: { contains: to } }
                    ]
                }
            ];
        }

        if (date) {
            where.date = new Date(date);
        }

        const rides = await prisma.ride.findMany({
            where,
            include: {
                driver: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        verified: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ rides }, { status: 200 });
    } catch (error) {
        console.error('Get rides error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch rides' },
            { status: 500 }
        );
    }
}

// POST /api/rides - Create a new ride
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            driverId,
            from,
            fromDetail,
            to,
            toDetail,
            date,
            time,
            seats,
            price,
            vehicleId
        } = body;

        // Validate required fields
        if (!driverId || !from || !to || !date || !time || !seats || !price) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const ride = await prisma.ride.create({
            data: {
                driverId,
                from,
                fromDetail: fromDetail || from,
                to,
                toDetail: toDetail || to,
                date: new Date(date),
                time,
                seats: parseInt(seats),
                price: parseFloat(price),
                amenities: amenities ? JSON.stringify(amenities) : null,
                status: 'active',
                vehicleId: vehicleId || null
            },
            include: {
                driver: {
                    select: {
                        id: true,
                        name: true,
                        rating: true,
                        verified: true
                    }
                }
            }
        });

        return NextResponse.json(
            { message: 'Ride created successfully', ride },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create ride error:', error);
        return NextResponse.json(
            { error: 'Failed to create ride' },
            { status: 500 }
        );
    }
}

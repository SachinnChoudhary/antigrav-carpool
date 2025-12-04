import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/users/[id] - Get user profile
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                rating: true,
                totalRides: true,
                verified: true,
                createdAt: true
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get ride statistics
        const ridesAsDriver = await prisma.ride.count({
            where: { driverId: params.id }
        });

        const ridesAsPassenger = await prisma.booking.count({
            where: { passengerId: params.id }
        });

        return NextResponse.json({
            user: {
                ...user,
                stats: {
                    ridesAsDriver,
                    ridesAsPassenger,
                    totalRides: ridesAsDriver + ridesAsPassenger
                }
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Get user error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/[id] - Update user profile
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { name, phone } = body;

        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                rating: true,
                verified: true
            }
        });

        return NextResponse.json(
            { message: 'Profile updated successfully', user },
            { status: 200 }
        );
    } catch (error) {
        console.error('Update user error:', error);
        return NextResponse.json(
            { error: 'Failed to update profile' },
            { status: 500 }
        );
    }
}

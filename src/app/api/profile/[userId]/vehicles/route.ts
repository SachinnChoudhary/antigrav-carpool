import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET vehicles for a user
export async function GET(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const vehicles = await prisma.vehicle.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(vehicles);
}

// POST to add a vehicle
export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const data = await request.json();

    // If driverLicenseUrl is provided, update the user's driver license info as well
    if (data.driverLicenseUrl) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                driverLicenseUrl: data.driverLicenseUrl,
                driverLicenseNumber: data.driverLicenseNumber,
                driverLicenseVerified: false, // Pending admin review
            },
        });
    }

    const vehicle = await prisma.vehicle.create({
        data: {
            userId,
            make: data.make,
            model: data.model,
            year: data.year,
            plateNumber: data.plateNumber,
            color: data.color,
            fuelType: data.fuelType,
        },
    });

    // Return updated list
    const vehicles = await prisma.vehicle.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles);
}

// DELETE a vehicle
export async function DELETE(request: Request, { params }: { params: Promise<{ userId: string }> }) {
    const { userId } = await params;
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('id');

    if (!vehicleId) return NextResponse.json({ error: 'Vehicle ID required' }, { status: 400 });

    await prisma.vehicle.delete({
        where: { id: vehicleId },
    });

    const vehicles = await prisma.vehicle.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vehicles);
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

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
        const { action, rideIds, data } = await request.json();

        if (!rideIds || !Array.isArray(rideIds) || rideIds.length === 0) {
            return NextResponse.json({ error: 'No rides selected' }, { status: 400 });
        }

        if (rideIds.length > 100) {
            return NextResponse.json({ error: 'Maximum 100 rides per bulk operation' }, { status: 400 });
        }

        let result;
        let affected = 0;

        switch (action) {
            case 'changeStatus':
                if (!data?.status) {
                    return NextResponse.json({ error: 'Status is required' }, { status: 400 });
                }
                result = await prisma.ride.updateMany({
                    where: { id: { in: rideIds } },
                    data: { status: data.status },
                });
                affected = result.count;
                break;

            case 'delete':
                result = await prisma.ride.deleteMany({
                    where: { id: { in: rideIds } },
                });
                affected = result.count;
                break;

            case 'export':
                const rides = await prisma.ride.findMany({
                    where: { id: { in: rideIds } },
                    include: {
                        driver: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                    },
                });

                const csv = [
                    ['ID', 'From', 'To', 'Date', 'Time', 'Seats', 'Price', 'Status', 'Driver Name', 'Driver Email', 'Created At'].join(','),
                    ...rides.map(r => [
                        r.id,
                        r.from,
                        r.to,
                        r.date.toISOString().split('T')[0],
                        r.time,
                        r.seats,
                        r.price,
                        r.status,
                        r.driver.name,
                        r.driver.email,
                        r.createdAt.toISOString(),
                    ].map(v => `"${v}"`).join(','))
                ].join('\n');

                return new NextResponse(csv, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="rides-export-${new Date().toISOString().split('T')[0]}.csv"`,
                    },
                });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({
            message: `Bulk ${action} completed successfully`,
            affected,
        });
    } catch (error) {
        console.error('Bulk action failed:', error);
        return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
    }
}

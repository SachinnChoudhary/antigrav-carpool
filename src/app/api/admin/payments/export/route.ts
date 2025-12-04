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
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }

        const payments = await prisma.payment.findMany({
            where,
            include: {
                payer: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                receiver: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                booking: {
                    select: {
                        id: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Generate CSV
        const headers = [
            'Transaction ID',
            'Date',
            'Payer Name',
            'Payer Email',
            'Receiver Name',
            'Receiver Email',
            'Booking ID',
            'Amount',
            'Status',
            'Payment Method',
            'Refund Amount',
            'Refund Reason',
        ];

        const rows = payments.map((payment) => [
            payment.id,
            payment.createdAt.toISOString(),
            payment.payer.name,
            payment.payer.email,
            payment.receiver.name,
            payment.receiver.email,
            payment.bookingId,
            payment.amount.toString(),
            payment.status,
            payment.method || 'N/A',
            payment.refundAmount?.toString() || '0',
            payment.refundReason || 'N/A',
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
        ].join('\n');

        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.csv"`,
            },
        });
    } catch (error) {
        console.error('Failed to export payments:', error);
        return NextResponse.json({ error: 'Failed to export payments' }, { status: 500 });
    }
}

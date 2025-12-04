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
        const { action, paymentIds, data } = await request.json();

        if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
            return NextResponse.json({ error: 'No payments selected' }, { status: 400 });
        }

        if (paymentIds.length > 100) {
            return NextResponse.json({ error: 'Maximum 100 payments per bulk operation' }, { status: 400 });
        }

        let affected = 0;

        switch (action) {
            case 'export':
                const payments = await prisma.payment.findMany({
                    where: { id: { in: paymentIds } },
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
                    },
                });

                const csv = [
                    ['ID', 'Amount', 'Status', 'Method', 'Payer Name', 'Payer Email', 'Receiver Name', 'Receiver Email', 'Refund Amount', 'Created At'].join(','),
                    ...payments.map(p => [
                        p.id,
                        p.amount,
                        p.status,
                        p.method || 'N/A',
                        p.payer.name,
                        p.payer.email,
                        p.receiver.name,
                        p.receiver.email,
                        p.refundAmount || 0,
                        p.createdAt.toISOString(),
                    ].map(v => `"${v}"`).join(','))
                ].join('\n');

                return new NextResponse(csv, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="payments-export-${new Date().toISOString().split('T')[0]}.csv"`,
                    },
                });

            case 'refund':
                if (!data?.refundAmount || !data?.refundReason) {
                    return NextResponse.json({ error: 'Refund amount and reason required' }, { status: 400 });
                }

                // Only refund completed payments
                const completedPayments = await prisma.payment.findMany({
                    where: {
                        id: { in: paymentIds },
                        status: 'completed',
                    },
                });

                for (const payment of completedPayments) {
                    const totalRefund = (payment.refundAmount || 0) + data.refundAmount;

                    if (totalRefund <= payment.amount) {
                        await prisma.payment.update({
                            where: { id: payment.id },
                            data: {
                                refundAmount: totalRefund,
                                refundReason: data.refundReason,
                                status: totalRefund === payment.amount ? 'refunded' : 'partially_refunded',
                            },
                        });
                        affected++;
                    }
                }

                return NextResponse.json({
                    message: `Bulk refund completed successfully`,
                    affected,
                    skipped: paymentIds.length - affected,
                });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Bulk action failed:', error);
        return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
    }
}

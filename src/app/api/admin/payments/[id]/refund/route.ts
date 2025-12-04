import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id: paymentId } = await params;
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
        const { refundAmount, refundReason } = await request.json();

        // Fetch the payment
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
        });

        if (!payment) {
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Validate payment can be refunded
        if (payment.status !== 'completed') {
            return NextResponse.json(
                { error: 'Only completed payments can be refunded' },
                { status: 400 }
            );
        }

        // Validate refund amount
        const currentRefundAmount = payment.refundAmount || 0;
        const totalRefundAmount = currentRefundAmount + refundAmount;

        if (totalRefundAmount > payment.amount) {
            return NextResponse.json(
                { error: 'Refund amount exceeds payment amount' },
                { status: 400 }
            );
        }

        // Determine new status
        let newStatus = payment.status;
        if (totalRefundAmount === payment.amount) {
            newStatus = 'refunded';
        } else if (totalRefundAmount > 0) {
            newStatus = 'partially_refunded';
        }

        // Update payment
        const updatedPayment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                refundAmount: totalRefundAmount,
                refundReason: refundReason || payment.refundReason,
                status: newStatus,
            },
        });

        return NextResponse.json({
            message: 'Refund processed successfully',
            payment: updatedPayment,
        });
    } catch (error) {
        console.error('Failed to process refund:', error);
        return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
    }
}

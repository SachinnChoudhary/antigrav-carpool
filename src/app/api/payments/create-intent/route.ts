import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { bookingId, amount } = body;

        if (!bookingId || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Get booking details
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                ride: true,
                passenger: true
            }
        });

        if (!booking) {
            return NextResponse.json(
                { error: 'Booking not found' },
                { status: 404 }
            );
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: formatAmountForStripe(amount),
            currency: 'usd',
            metadata: {
                bookingId: booking.id,
                passengerId: booking.passengerId,
                rideId: booking.rideId
            },
            description: `Ride from ${booking.ride.from} to ${booking.ride.to}`
        });

        // Update booking with payment intent
        await prisma.booking.update({
            where: { id: bookingId },
            data: {
                paymentIntentId: paymentIntent.id,
                amount: amount
            }
        });

        return NextResponse.json(
            {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Create payment intent error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment intent' },
            { status: 500 }
        );
    }
}

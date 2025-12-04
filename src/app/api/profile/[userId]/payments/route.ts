import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        const payments = await prisma.payment.findMany({
            where: {
                OR: [
                    { payerId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                booking: {
                    include: {
                        ride: {
                            select: {
                                from: true,
                                to: true,
                                date: true
                            }
                        }
                    }
                },
                payer: {
                    select: {
                        name: true
                    }
                },
                receiver: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(payments);
    } catch (error) {
        console.error('Failed to fetch payments:', error);
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        );
    }
}

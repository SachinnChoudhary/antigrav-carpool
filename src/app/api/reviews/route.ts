import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reviews - Create a review
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { rideId, reviewerId, rating, comment } = body;

        if (!rideId || !reviewerId || !rating) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        const review = await prisma.review.create({
            data: {
                rideId,
                reviewerId,
                rating: parseInt(rating),
                comment: comment || null
            },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                ride: {
                    include: {
                        driver: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        // Update driver's rating
        const driverId = review.ride.driver.id;
        const allReviews = await prisma.review.findMany({
            where: {
                ride: {
                    driverId
                }
            }
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.user.update({
            where: { id: driverId },
            data: { rating: avgRating }
        });

        return NextResponse.json(
            { message: 'Review created successfully', review },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create review error:', error);
        return NextResponse.json(
            { error: 'Failed to create review' },
            { status: 500 }
        );
    }
}

// GET /api/reviews - Get reviews for a ride or user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rideId = searchParams.get('rideId');
        const userId = searchParams.get('userId');

        const where: any = {};
        if (rideId) where.rideId = rideId;
        if (userId) {
            where.ride = { driverId: userId };
        }

        const reviews = await prisma.review.findMany({
            where,
            include: {
                reviewer: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                ride: {
                    select: {
                        id: true,
                        from: true,
                        to: true,
                        date: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ reviews }, { status: 200 });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

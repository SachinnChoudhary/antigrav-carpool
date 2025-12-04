import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/popular-routes - Get popular routes
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const routes = await prisma.popularRoute.findMany({
            orderBy: [
                { searchCount: 'desc' },
                { lastSearched: 'desc' },
            ],
            take: limit,
        });

        return NextResponse.json({ routes });
    } catch (error) {
        console.error('Get popular routes error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch popular routes' },
            { status: 500 }
        );
    }
}

// POST /api/popular-routes/track - Track a search
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { from, to, fromLat, fromLng, toLat, toLng } = body;

        // Update or create popular route
        const route = await prisma.popularRoute.upsert({
            where: {
                from_to: { from, to },
            },
            update: {
                searchCount: { increment: 1 },
                lastSearched: new Date(),
            },
            create: {
                from,
                to,
                fromLat,
                fromLng,
                toLat,
                toLng,
                searchCount: 1,
            },
        });

        return NextResponse.json({ route });
    } catch (error) {
        console.error('Track search error:', error);
        return NextResponse.json(
            { error: 'Failed to track search' },
            { status: 500 }
        );
    }
}

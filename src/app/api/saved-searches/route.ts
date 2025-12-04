import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/saved-searches - Get user's saved searches
export async function GET(request: NextRequest) {
    const authCheck = await requireAuth(request);

    if ('error' in authCheck) {
        return NextResponse.json(
            { error: authCheck.error },
            { status: authCheck.status }
        );
    }

    try {
        const searches = await prisma.savedSearch.findMany({
            where: { userId: authCheck.user.userId },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ searches });
    } catch (error) {
        console.error('Get saved searches error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch saved searches' },
            { status: 500 }
        );
    }
}

// POST /api/saved-searches - Create saved search
export async function POST(request: NextRequest) {
    const authCheck = await requireAuth(request);

    if ('error' in authCheck) {
        return NextResponse.json(
            { error: authCheck.error },
            { status: authCheck.status }
        );
    }

    try {
        const body = await request.json();
        const { name, from, to, flexibleDates, maxPrice, minSeats, amenities, alertEnabled } = body;

        const search = await prisma.savedSearch.create({
            data: {
                userId: authCheck.user.userId,
                name,
                from,
                to,
                flexibleDates: flexibleDates || false,
                maxPrice,
                minSeats,
                amenities,
                alertEnabled: alertEnabled || false,
            },
        });

        return NextResponse.json({ search }, { status: 201 });
    } catch (error) {
        console.error('Create saved search error:', error);
        return NextResponse.json(
            { error: 'Failed to create saved search' },
            { status: 500 }
        );
    }
}

// DELETE /api/saved-searches/[id] - Delete saved search
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const authCheck = await requireAuth(request);

    if ('error' in authCheck) {
        return NextResponse.json(
            { error: authCheck.error },
            { status: authCheck.status }
        );
    }

    try {
        await prisma.savedSearch.delete({
            where: {
                id: params.id,
                userId: authCheck.user.userId, // Ensure user owns this search
            },
        });

        return NextResponse.json({ message: 'Search deleted' });
    } catch (error) {
        console.error('Delete saved search error:', error);
        return NextResponse.json(
            { error: 'Failed to delete saved search' },
            { status: 500 }
        );
    }
}

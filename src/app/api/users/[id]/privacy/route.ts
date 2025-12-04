import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/users/[id]/privacy - Get privacy settings
export async function GET(
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

    // Users can only view their own privacy settings
    if (authCheck.user.userId !== params.id) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                profileVisibility: true,
                showEmail: true,
                showPhone: true,
                showRideHistory: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Get privacy settings error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch privacy settings' },
            { status: 500 }
        );
    }
}

// PATCH /api/users/[id]/privacy - Update privacy settings
export async function PATCH(
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

    // Users can only update their own privacy settings
    if (authCheck.user.userId !== params.id) {
        return NextResponse.json(
            { error: 'Forbidden' },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const { profileVisibility, showEmail, showPhone, showRideHistory } = body;

        // Validate profileVisibility
        const validVisibilities = ['public', 'friends', 'private'];
        if (profileVisibility && !validVisibilities.includes(profileVisibility)) {
            return NextResponse.json(
                { error: 'Invalid profile visibility' },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: {
                ...(profileVisibility && { profileVisibility }),
                ...(showEmail !== undefined && { showEmail }),
                ...(showPhone !== undefined && { showPhone }),
                ...(showRideHistory !== undefined && { showRideHistory }),
            },
            select: {
                profileVisibility: true,
                showEmail: true,
                showPhone: true,
                showRideHistory: true,
            },
        });

        return NextResponse.json({
            message: 'Privacy settings updated',
            settings: user,
        });
    } catch (error) {
        console.error('Update privacy settings error:', error);
        return NextResponse.json(
            { error: 'Failed to update privacy settings' },
            { status: 500 }
        );
    }
}

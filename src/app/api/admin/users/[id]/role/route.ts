import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// PATCH /api/admin/users/[id]/role - Update user role
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const authCheck = await requireAdmin(request);

    if ('error' in authCheck) {
        return NextResponse.json(
            { error: authCheck.error },
            { status: authCheck.status }
        );
    }

    try {
        const body = await request.json();
        const { role } = body;
        const { id } = await params;

        // Validate role
        const validRoles = ['admin', 'driver', 'passenger'];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: 'Invalid role' },
                { status: 400 }
            );
        }

        const user = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return NextResponse.json({
            message: 'User role updated',
            user,
        });
    } catch (error) {
        console.error('Update role error:', error);
        return NextResponse.json(
            { error: 'Failed to update user role' },
            { status: 500 }
        );
    }
}

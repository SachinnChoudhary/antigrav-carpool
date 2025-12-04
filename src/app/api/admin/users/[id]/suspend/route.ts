import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

// PATCH /api/admin/users/[id]/suspend - Suspend user account
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
        const { suspend, reason } = body;
        const { id } = await params;

        const adminId = authCheck.user.userId;

        const user = await prisma.user.update({
            where: { id },
            data: {
                suspended: suspend,
                suspendedAt: suspend ? new Date() : null,
                suspensionReason: suspend ? reason : null,
                suspendedBy: suspend ? adminId : null,
            },
            select: {
                id: true,
                name: true,
                email: true,
                suspended: true,
                suspendedAt: true,
                suspensionReason: true,
            },
        });

        return NextResponse.json({
            message: suspend ? 'User suspended' : 'User unsuspended',
            user,
        });
    } catch (error) {
        console.error('Suspend user error:', error);
        return NextResponse.json(
            { error: 'Failed to update user status' },
            { status: 500 }
        );
    }
}

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
        const { action, userIds, data } = await request.json();

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return NextResponse.json({ error: 'No users selected' }, { status: 400 });
        }

        if (userIds.length > 100) {
            return NextResponse.json({ error: 'Maximum 100 users per bulk operation' }, { status: 400 });
        }

        let result;
        let affected = 0;

        switch (action) {
            case 'suspend':
                result = await prisma.user.updateMany({
                    where: { id: { in: userIds } },
                    data: {
                        suspended: true,
                        suspendedAt: new Date(),
                        suspensionReason: data?.reason || 'Bulk suspension by admin',
                        suspendedBy: decoded.userId,
                    },
                });
                affected = result.count;
                break;

            case 'activate':
                result = await prisma.user.updateMany({
                    where: { id: { in: userIds } },
                    data: {
                        suspended: false,
                        suspendedAt: null,
                        suspensionReason: null,
                        suspendedBy: null,
                    },
                });
                affected = result.count;
                break;

            case 'changeRole':
                if (!data?.role) {
                    return NextResponse.json({ error: 'Role is required' }, { status: 400 });
                }
                result = await prisma.user.updateMany({
                    where: { id: { in: userIds } },
                    data: { role: data.role },
                });
                affected = result.count;
                break;

            case 'delete':
                result = await prisma.user.deleteMany({
                    where: {
                        id: { in: userIds },
                        role: { not: 'admin' } // Prevent deleting admin users
                    },
                });
                affected = result.count;
                break;

            case 'export':
                const users = await prisma.user.findMany({
                    where: { id: { in: userIds } },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        role: true,
                        suspended: true,
                        createdAt: true,
                    },
                });

                const csv = [
                    ['ID', 'Name', 'Email', 'Phone', 'Role', 'Suspended', 'Created At'].join(','),
                    ...users.map(u => [
                        u.id,
                        u.name,
                        u.email,
                        u.phone || '',
                        u.role,
                        u.suspended,
                        u.createdAt.toISOString(),
                    ].map(v => `"${v}"`).join(','))
                ].join('\n');

                return new NextResponse(csv, {
                    headers: {
                        'Content-Type': 'text/csv',
                        'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`,
                    },
                });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json({
            message: `Bulk ${action} completed successfully`,
            affected,
        });
    } catch (error) {
        console.error('Bulk action failed:', error);
        return NextResponse.json({ error: 'Bulk action failed' }, { status: 500 });
    }
}

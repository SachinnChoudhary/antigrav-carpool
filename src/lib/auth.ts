import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './jwt';

export async function requireAuth(request: NextRequest) {
    const token = request.cookies.get('token')?.value;

    if (!token) {
        return { error: 'Unauthorized', status: 401 };
    }

    const payload = await verifyToken(token);

    if (!payload) {
        return { error: 'Invalid token', status: 401 };
    }

    return { user: payload };
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
    const authResult = await requireAuth(request);

    if ('error' in authResult) {
        return authResult;
    }

    const userId = authResult.user.userId;

    // Get user from database to check role
    const { prisma } = await import('./prisma');
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true, suspended: true },
    });

    if (!user) {
        return { error: 'User not found', status: 404 };
    }

    if (user.suspended) {
        return { error: 'Account suspended', status: 403 };
    }

    if (!allowedRoles.includes(user.role)) {
        return { error: 'Insufficient permissions', status: 403 };
    }

    return { user: { ...authResult.user, role: user.role } };
}

export async function requireAdmin(request: NextRequest) {
    return requireRole(request, ['admin']);
}

export async function requireDriver(request: NextRequest) {
    return requireRole(request, ['admin', 'driver']);
}

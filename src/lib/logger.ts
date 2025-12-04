import { prisma } from './prisma';

export interface LogActivityParams {
    userId?: string;
    actorType?: 'user' | 'admin' | 'system';
    actionType: string;
    targetType?: string;
    targetId?: string;
    description: string;
    ipAddress?: string;
    userAgent?: string;
    status?: 'success' | 'failure' | 'pending';
    metadata?: any;
}

export async function logActivity(params: LogActivityParams) {
    try {
        await prisma.activityLog.create({
            data: {
                userId: params.userId || null,
                actorType: params.actorType || 'user',
                actionType: params.actionType,
                targetType: params.targetType || null,
                targetId: params.targetId || null,
                description: params.description,
                ipAddress: params.ipAddress || null,
                userAgent: params.userAgent || null,
                status: params.status || 'success',
                metadata: params.metadata || null,
            },
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
        // Don't throw - logging failures shouldn't break the main operation
    }
}

export async function logAdminAction(
    adminId: string,
    action: string,
    target: { type: string; id: string },
    description: string,
    request: Request,
    metadata?: any
) {
    const ipAddress = request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip') ||
        'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await logActivity({
        userId: adminId,
        actorType: 'admin',
        actionType: action,
        targetType: target.type,
        targetId: target.id,
        description,
        ipAddress,
        userAgent,
        metadata,
    });
}

export async function logUserActivity(
    userId: string,
    action: string,
    description: string,
    request?: Request,
    metadata?: any
) {
    const ipAddress = request?.headers.get('x-forwarded-for') ||
        request?.headers.get('x-real-ip') ||
        'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await logActivity({
        userId,
        actorType: 'user',
        actionType: action,
        description,
        ipAddress,
        userAgent,
        metadata,
    });
}

export async function logSystemEvent(
    action: string,
    description: string,
    target?: { type: string; id: string },
    metadata?: any
) {
    await logActivity({
        actorType: 'system',
        actionType: action,
        targetType: target?.type,
        targetId: target?.id,
        description,
        metadata,
    });
}

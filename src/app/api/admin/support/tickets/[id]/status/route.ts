import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        let token = request.headers.get('Authorization')?.split(' ')[1];
        if (!token) {
            token = request.cookies.get('token')?.value;
        }

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { role: true }
        });

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.update({
            where: { id: params.id },
            data: { status },
        });

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error('Failed to update ticket status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

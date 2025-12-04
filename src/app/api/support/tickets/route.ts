import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// POST: Create a new support ticket
export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { subject, message, category, priority } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: decoded.userId,
                subject,
                message,
                category: category || 'general',
                priority: priority || 'medium',
            },
        });

        return NextResponse.json({ ticket }, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create support ticket:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

// GET: Fetch support tickets (Admin only)
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const priority = searchParams.get('priority');

        const where: any = {};
        if (status && status !== 'all') where.status = status;
        if (priority && priority !== 'all') where.priority = priority;

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ tickets });
    } catch (error) {
        console.error('Failed to fetch support tickets:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

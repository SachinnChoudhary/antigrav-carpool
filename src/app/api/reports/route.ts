import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/reports
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { reporterId, reportedId, reason, description } = body;

        if (!reporterId || !reportedId || !reason) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const report = await prisma.report.create({
            data: {
                reporterId,
                reportedId,
                reason,
                description,
                status: 'pending'
            }
        });

        return NextResponse.json({ report }, { status: 201 });
    } catch (error) {
        console.error('Create report error:', error);
        return NextResponse.json(
            { error: 'Failed to create report' },
            { status: 500 }
        );
    }
}

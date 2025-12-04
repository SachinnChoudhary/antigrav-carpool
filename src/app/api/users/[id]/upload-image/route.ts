import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Generate unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const timestamp = Date.now();
        const filename = `${id}-${timestamp}${path.extname(file.name)}`;
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        const filepath = path.join(uploadDir, filename);

        // Ensure upload directory exists
        const { mkdir } = require('fs/promises');
        await mkdir(uploadDir, { recursive: true });

        // Save file
        await writeFile(filepath, buffer);

        // Update user profile
        const user = await prisma.user.update({
            where: { id },
            data: { profileImage: `/uploads/${filename}` },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                rating: true,
                verified: true
            }
        });

        return NextResponse.json(
            { message: 'Profile picture uploaded successfully', user },
            { status: 200 }
        );
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}

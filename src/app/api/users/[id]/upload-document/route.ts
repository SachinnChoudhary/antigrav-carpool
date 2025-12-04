import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'id_document' or 'driver_license'

    if (!file) {
        return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${type}_${id}_${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    try {
        await mkdir(uploadDir, { recursive: true });
    } catch (error) {
        // Ignore error if directory exists
    }

    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/documents/${filename}`;
    return NextResponse.json({ url });
}

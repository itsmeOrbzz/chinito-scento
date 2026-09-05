import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure target directory public/scent-assets exists
    const uploadDir = path.join(process.cwd(), 'public', 'scent-assets');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean filename
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Date.now()}_${sanitizedOriginalName}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to public/scent-assets/
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/scent-assets/${fileName}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileName,
    });
  } catch (error: any) {
    console.error('Failed to save uploaded scent asset:', error);
    return NextResponse.json({ error: error.message || 'Failed to save upload' }, { status: 500 });
  }
}

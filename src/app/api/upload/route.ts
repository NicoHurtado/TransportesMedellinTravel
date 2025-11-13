import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se proporcionó ningún archivo',
        },
        { status: 400 }
      );
    }

    // Validar que sea una imagen PNG
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'El archivo debe ser una imagen',
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}_${originalName}`;

    // Determinar el tipo de upload (vehicles o services)
    const uploadType = request.headers.get('x-upload-type') || 'services';
    
    // Crear directorio si no existe
    const uploadDir = join(process.cwd(), 'public', 'uploads', uploadType);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }

    // Guardar archivo
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Retornar URL relativa
    const imageUrl = `/uploads/${uploadType}/${fileName}`;

    return NextResponse.json({
      success: true,
      data: {
        url: imageUrl,
        fileName,
      },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al subir el archivo',
      },
      { status: 500 }
    );
  }
}


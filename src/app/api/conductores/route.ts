import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener todos los conductores
export async function GET() {
  try {
    const conductores = await prisma.conductor.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: conductores,
    });
  } catch (error) {
    console.error('Error fetching conductores:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los conductores',
      },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo conductor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, whatsapp, notasAdicionales } = body;

    if (!nombre || !whatsapp) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre y WhatsApp son requeridos',
        },
        { status: 400 }
      );
    }

    const nuevoConductor = await prisma.conductor.create({
      data: {
        nombre,
        whatsapp,
        notasAdicionales: notasAdicionales || null,
        activo: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: nuevoConductor,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating conductor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear el conductor',
      },
      { status: 500 }
    );
  }
}


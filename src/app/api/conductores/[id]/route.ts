import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener un conductor específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const conductor = await prisma.conductor.findUnique({
      where: { id },
    });

    if (!conductor) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conductor no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conductor,
    });
  } catch (error) {
    console.error('Error fetching conductor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el conductor',
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un conductor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre, whatsapp, notasAdicionales, activo } = body;

    const conductorActualizado = await prisma.conductor.update({
      where: { id },
      data: {
        nombre,
        whatsapp,
        notasAdicionales,
        activo,
      },
    });

    return NextResponse.json({
      success: true,
      data: conductorActualizado,
    });
  } catch (error) {
    console.error('Error updating conductor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el conductor',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un conductor (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Soft delete - solo marcamos como inactivo
    const conductorEliminado = await prisma.conductor.update({
      where: { id },
      data: {
        activo: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: conductorEliminado,
    });
  } catch (error) {
    console.error('Error deleting conductor:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar el conductor',
      },
      { status: 500 }
    );
  }
}


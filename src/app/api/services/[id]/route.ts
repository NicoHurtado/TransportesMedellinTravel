import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT - Actualizar servicio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    const {
      nombreEs,
      nombreEn,
      descripcionCortaEs,
      descripcionCortaEn,
      descripcionCompletaEs,
      descripcionCompletaEn,
      imagenUrl,
      tipo,
      activo,
      ordenDisplay,
      configuracion,
    } = body;

    const servicioActualizado = await prisma.servicio.update({
      where: { id },
      data: {
        nombreEs,
        nombreEn,
        descripcionCortaEs,
        descripcionCortaEn,
        descripcionCompletaEs,
        descripcionCompletaEn,
        imagenUrl,
        tipo,
        activo,
        ordenDisplay,
        configuracion,
      },
    });

    return NextResponse.json({
      success: true,
      data: servicioActualizado,
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el servicio',
      },
      { status: 500 }
    );
  }
}

// GET - Obtener un servicio específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    const servicio = await prisma.servicio.findUnique({
      where: { id },
    });

    if (!servicio) {
      return NextResponse.json(
        {
          success: false,
          error: 'Servicio no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: servicio,
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el servicio',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar servicio definitivamente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar que el servicio existe
    const servicio = await prisma.servicio.findUnique({
      where: { id },
    });

    if (!servicio) {
      return NextResponse.json(
        {
          success: false,
          error: 'Servicio no encontrado',
        },
        { status: 404 }
      );
    }

    // Borrado definitivo: eliminar de la base de datos
    await prisma.servicio.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Servicio eliminado definitivamente',
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar el servicio',
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener un vehículo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id },
    });

    if (!vehiculo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehículo no encontrado',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: vehiculo.id,
        nombre: vehiculo.nombre,
        capacidadMin: vehiculo.capacidadMin,
        capacidadMax: vehiculo.capacidadMax,
        imagenUrl: vehiculo.imagenUrl,
        tipo: vehiculo.tipo,
        activo: vehiculo.activo,
        createdAt: vehiculo.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el vehículo',
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un vehículo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nombre, capacidadMin, capacidadMax, imagenUrl, tipo, activo } = body;

    const vehiculo = await prisma.vehiculo.update({
      where: { id },
      data: {
        ...(nombre && { nombre }),
        ...(capacidadMin !== undefined && { capacidadMin: parseInt(capacidadMin) }),
        ...(capacidadMax !== undefined && { capacidadMax: parseInt(capacidadMax) }),
        ...(imagenUrl !== undefined && { imagenUrl }),
        ...(tipo !== undefined && { tipo }),
        ...(activo !== undefined && { activo }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: vehiculo.id,
        nombre: vehiculo.nombre,
        capacidadMin: vehiculo.capacidadMin,
        capacidadMax: vehiculo.capacidadMax,
        imagenUrl: vehiculo.imagenUrl,
        tipo: vehiculo.tipo,
        activo: vehiculo.activo,
        createdAt: vehiculo.createdAt,
      },
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el vehículo',
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un vehículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Verificar si el vehículo tiene reservas asociadas
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id },
      include: {
        reservasAirport: { take: 1 },
        reservasGuatape: { take: 1 },
        reservasCityTour: { take: 1 },
      },
    });

    if (!vehiculo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Vehículo no encontrado',
        },
        { status: 404 }
      );
    }

    // Si tiene reservas, desactivar en lugar de eliminar
    if (
      vehiculo.reservasAirport.length > 0 ||
      vehiculo.reservasGuatape.length > 0 ||
      vehiculo.reservasCityTour.length > 0
    ) {
      await prisma.vehiculo.update({
        where: { id },
        data: { activo: false },
      });

      return NextResponse.json({
        success: true,
        message: 'Vehículo desactivado (tiene reservas asociadas)',
      });
    }

    // Si no tiene reservas, eliminar
    await prisma.vehiculo.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Vehículo eliminado correctamente',
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar el vehículo',
      },
      { status: 500 }
    );
  }
}


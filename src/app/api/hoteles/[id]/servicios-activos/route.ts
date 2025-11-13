import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener servicios activos para un hotel
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de hotel inválido',
        },
        { status: 400 }
      );
    }

    // Obtener servicios activos para este hotel
    const serviciosActivos = await prisma.hotelServicio.findMany({
      where: {
        hotelId,
        activo: true,
      },
      include: {
        servicio: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: serviciosActivos.map((sa) => ({
        servicioId: sa.servicioId,
        activo: sa.activo,
      })),
    });
  } catch (error) {
    console.error('Error fetching active services for hotel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los servicios activos del hotel',
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar servicios activos para un hotel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de hotel inválido',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { serviciosActivos } = body; // Array de { servicioId: number, activo: boolean }

    if (!Array.isArray(serviciosActivos)) {
      return NextResponse.json(
        {
          success: false,
          error: 'serviciosActivos debe ser un array',
        },
        { status: 400 }
      );
    }

    // Verificar que el hotel existe
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hotel no encontrado',
        },
        { status: 404 }
      );
    }

    // Procesar cada servicio
    for (const servicioData of serviciosActivos) {
      const { servicioId, activo } = servicioData;

      if (activo) {
        // Crear o actualizar para activar
        await prisma.hotelServicio.upsert({
          where: {
            hotelId_servicioId: {
              hotelId,
              servicioId,
            },
          },
          update: {
            activo: true,
          },
          create: {
            hotelId,
            servicioId,
            activo: true,
          },
        });
      } else {
        // Desactivar o eliminar
        await prisma.hotelServicio.updateMany({
          where: {
            hotelId,
            servicioId,
          },
          data: {
            activo: false,
          },
        });
      }
    }

    // Obtener servicios activos actualizados
    const serviciosActivosActualizados = await prisma.hotelServicio.findMany({
      where: {
        hotelId,
        activo: true,
      },
      include: {
        servicio: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: serviciosActivosActualizados.map((sa) => ({
        servicioId: sa.servicioId,
        activo: sa.activo,
      })),
    });
  } catch (error) {
    console.error('Error updating active services for hotel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar los servicios activos del hotel',
      },
      { status: 500 }
    );
  }
}


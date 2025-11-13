import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { codigo: string } }
) {
  try {
    const { codigo } = params;

    const hotel = await prisma.hotel.findUnique({
      where: {
        codigo: codigo.toUpperCase(),
        activo: true,
      },
    });

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Código de hotel no válido',
        },
        { status: 404 }
      );
    }

    // Obtener comisiones usando SQL directo
    const comisionesData = await prisma.$queryRaw<any[]>`
      SELECT 
        hc.id,
        hc."hotelId",
        hc."servicio",
        hc."vehiculoId",
        hc."comision",
        hc."createdAt",
        hc."updatedAt",
        v.id as "vehiculo_id",
        v.nombre as "vehiculo_nombre",
        v."capacidadMin" as "vehiculo_capacidadMin",
        v."capacidadMax" as "vehiculo_capacidadMax",
        v."imagenUrl" as "vehiculo_imagenUrl"
      FROM hotel_comisiones hc
      LEFT JOIN vehiculos v ON hc."vehiculoId" = v.id
      WHERE hc."hotelId" = ${hotel.id}
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: hotel.id,
        codigo: hotel.codigo,
        nombre: hotel.nombre,
        comisionPorcentaje: Number(hotel.comisionPorcentaje),
        comisiones: comisionesData.map((c: any) => ({
          id: Number(c.id),
          servicio: c.servicio,
          vehiculoId: Number(c.vehiculoId),
          vehiculo: c.vehiculo_id ? {
            id: Number(c.vehiculo_id),
            nombre: c.vehiculo_nombre,
            capacidadMin: Number(c.vehiculo_capacidadMin),
            capacidadMax: Number(c.vehiculo_capacidadMax),
            imagenUrl: c.vehiculo_imagenUrl,
          } : null,
          comision: Number(c.comision),
        })),
      },
    });
  } catch (error) {
    console.error('Error validating hotel code:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al validar el código de hotel',
      },
      { status: 500 }
    );
  }
}


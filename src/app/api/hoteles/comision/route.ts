import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener la comisión específica de un hotel para un servicio y vehículo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    const servicio = searchParams.get('servicio');
    const vehiculoId = searchParams.get('vehiculoId');

    if (!hotelId || !servicio || !vehiculoId) {
      return NextResponse.json(
        {
          success: false,
          error: 'hotelId, servicio y vehiculoId son requeridos',
        },
        { status: 400 }
      );
    }

    const hotelIdNum = parseInt(hotelId);
    const vehiculoIdNum = parseInt(vehiculoId);

    if (isNaN(hotelIdNum) || isNaN(vehiculoIdNum)) {
      return NextResponse.json(
        {
          success: false,
          error: 'hotelId y vehiculoId deben ser números válidos',
        },
        { status: 400 }
      );
    }

    // Obtener la comisión usando SQL directo
    const comisionData = await prisma.$queryRaw<any[]>`
      SELECT 
        hc.id,
        hc."hotelId",
        hc."servicio",
        hc."vehiculoId",
        hc."comision"
      FROM hotel_comisiones hc
      WHERE hc."hotelId" = ${hotelIdNum}
        AND hc."servicio" = ${servicio}
        AND hc."vehiculoId" = ${vehiculoIdNum}
      LIMIT 1
    `;

    if (comisionData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          comision: 0,
          encontrada: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        comision: Number(comisionData[0].comision),
        encontrada: true,
      },
    });
  } catch (error) {
    console.error('Error fetching hotel commission:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la comisión del hotel',
      },
      { status: 500 }
    );
  }
}


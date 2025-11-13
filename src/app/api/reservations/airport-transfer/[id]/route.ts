import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reserva = await prisma.reservaAirportTransfer.findUnique({
      where: {
        id: parseInt(params.id),
      },
      include: {
        vehiculo: true,
        hotel: true,
      },
    });

    if (!reserva) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva no encontrada',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: reserva,
    });
  } catch (error) {
    console.error('Error fetching reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener la reserva',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const reserva = await prisma.reservaAirportTransfer.update({
      where: {
        id: parseInt(params.id),
      },
      data: body,
      include: {
        vehiculo: true,
        hotel: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: reserva,
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar la reserva',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.reservaAirportTransfer.delete({
      where: {
        id: parseInt(params.id),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Reserva eliminada correctamente',
    });
  } catch (error) {
    console.error('Error deleting reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar la reserva',
      },
      { status: 500 }
    );
  }
}



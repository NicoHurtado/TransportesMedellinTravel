import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para encontrar y actualizar la reserva por codigoReserva
async function updateReservationStatus(
  codigoReserva: string,
  nuevoEstado: string
) {
  // Buscar en todas las tablas de reservas
  const [
    airportTransfer,
    guatapeTour,
    cityTour,
    graffitiTour,
    haciendaNapolesTour,
    occidenteTour,
    parapenteTour,
    atvTour,
    jardinTour,
    coffeeFarmTour,
  ] = await Promise.all([
    prisma.reservaAirportTransfer.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaGuatapeTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaCityTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaGraffitiTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaHaciendaNapolesTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaOccidenteTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaParapenteTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaAtvTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaJardinTour.findUnique({
      where: { codigoReserva },
    }),
    prisma.reservaCoffeeFarmTour.findUnique({
      where: { codigoReserva },
    }),
  ]);

  // Determinar qué modelo usar
  let model: any = null;
  let reserva: any = null;

  if (airportTransfer) {
    model = prisma.reservaAirportTransfer;
    reserva = airportTransfer;
  } else if (guatapeTour) {
    model = prisma.reservaGuatapeTour;
    reserva = guatapeTour;
  } else if (cityTour) {
    model = prisma.reservaCityTour;
    reserva = cityTour;
  } else if (graffitiTour) {
    model = prisma.reservaGraffitiTour;
    reserva = graffitiTour;
  } else if (haciendaNapolesTour) {
    model = prisma.reservaHaciendaNapolesTour;
    reserva = haciendaNapolesTour;
  } else if (occidenteTour) {
    model = prisma.reservaOccidenteTour;
    reserva = occidenteTour;
  } else if (parapenteTour) {
    model = prisma.reservaParapenteTour;
    reserva = parapenteTour;
  } else if (atvTour) {
    model = prisma.reservaAtvTour;
    reserva = atvTour;
  } else if (jardinTour) {
    model = prisma.reservaJardinTour;
    reserva = jardinTour;
  } else if (coffeeFarmTour) {
    model = prisma.reservaCoffeeFarmTour;
    reserva = coffeeFarmTour;
  }

  if (!model || !reserva) {
    return null;
  }

  // Actualizar el estado
  const reservaActualizada = await model.update({
    where: { id: reserva.id },
    data: { estado: nuevoEstado },
    include: {
      vehiculo: true,
      hotel: true,
    },
  });

  return reservaActualizada;
}

export async function POST(request: NextRequest) {
  try {
    const { codigoReserva, estado } = await request.json();

    if (!codigoReserva || !estado) {
      return NextResponse.json(
        { error: 'Missing codigoReserva or estado' },
        { status: 400 }
      );
    }

    console.log('🔄 Actualizando estado de reserva:', {
      codigoReserva,
      nuevoEstado: estado,
    });

    const reservaActualizada = await updateReservationStatus(
      codigoReserva,
      estado
    );

    if (!reservaActualizada) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    console.log('✅ Estado de reserva actualizado:', {
      codigoReserva,
      estadoAnterior: reservaActualizada.estado,
      estadoNuevo: estado,
    });

    return NextResponse.json({
      success: true,
      data: reservaActualizada,
      message: 'Estado de reserva actualizado correctamente',
    });
  } catch (error: any) {
    console.error('❌ Error al actualizar estado de reserva:', error);
    return NextResponse.json(
      { error: 'Error updating reservation status', message: error.message },
      { status: 500 }
    );
  }
}


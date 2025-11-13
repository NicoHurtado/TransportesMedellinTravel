import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

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
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaGuatapeTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaCityTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaGraffitiTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaHaciendaNapolesTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaOccidenteTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaParapenteTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaAtvTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaJardinTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
      prisma.reservaCoffeeFarmTour.findUnique({
        where: { codigoReserva: code },
        include: { vehiculo: true, hotel: true },
      }),
    ]);

    // Encontrar la reserva que existe
    const reserva =
      airportTransfer ||
      guatapeTour ||
      cityTour ||
      graffitiTour ||
      haciendaNapolesTour ||
      occidenteTour ||
      parapenteTour ||
      atvTour ||
      jardinTour ||
      coffeeFarmTour;

    if (!reserva) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva no encontrada',
        },
        { status: 404 }
      );
    }

    // Determinar el tipo de servicio
    let tipoServicio = '';
    let nombreServicio = '';

    if (airportTransfer) {
      tipoServicio = 'airport-transfer';
      nombreServicio = 'Transporte Aeropuerto';
    } else if (guatapeTour) {
      tipoServicio = 'guatape-tour';
      nombreServicio = 'Tour Guatapé';
    } else if (cityTour) {
      tipoServicio = 'city-tour';
      nombreServicio = 'City Tour';
    } else if (graffitiTour) {
      tipoServicio = 'graffiti-tour';
      nombreServicio = 'Comuna 13 - Graffiti Tour';
    } else if (haciendaNapolesTour) {
      tipoServicio = 'hacienda-napoles-tour';
      nombreServicio = 'Tour Hacienda Nápoles';
    } else if (occidenteTour) {
      tipoServicio = 'occidente-tour';
      nombreServicio = 'Tour Occidente';
    } else if (parapenteTour) {
      tipoServicio = 'parapente-tour';
      nombreServicio = 'Tour Parapente';
    } else if (atvTour) {
      tipoServicio = 'atv-tour';
      nombreServicio = 'Tour ATV';
    } else if (jardinTour) {
      tipoServicio = 'jardin-tour';
      nombreServicio = 'Tour Jardín';
    } else if (coffeeFarmTour) {
      tipoServicio = 'coffee-farm-tour';
      nombreServicio = 'Tour Finca Cafetera';
    }

    // Serializar la reserva y convertir Decimal a Number para tarifaCancelacion
    // También serializar fechas y horas correctamente
    const reservaSerializada = {
      ...reserva,
      tipoServicio,
      nombreServicio,
      // Serializar fecha como string ISO
      fecha: reserva.fecha instanceof Date 
        ? reserva.fecha.toISOString().split('T')[0] 
        : reserva.fecha,
      // Serializar hora como string HH:MM
      hora: reserva.hora instanceof Date 
        ? `${String(reserva.hora.getHours()).padStart(2, '0')}:${String(reserva.hora.getMinutes()).padStart(2, '0')}`
        : reserva.hora,
      // Serializar createdAt si existe
      createdAt: reserva.createdAt instanceof Date 
        ? reserva.createdAt.toISOString() 
        : reserva.createdAt,
      hotel: reserva.hotel ? {
        id: reserva.hotel.id,
        nombre: reserva.hotel.nombre,
        tarifaCancelacion: reserva.hotel.tarifaCancelacion 
          ? Number(reserva.hotel.tarifaCancelacion) 
          : null,
      } : null,
    };

    return NextResponse.json({
      success: true,
      data: reservaSerializada,
    });
  } catch (error) {
    console.error('Error tracking reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al rastrear la reserva',
      },
      { status: 500 }
    );
  }
}



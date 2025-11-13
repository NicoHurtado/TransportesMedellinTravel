import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Estados permitidos para el calendario
    const estadosPermitidos = [
      'pendiente_por_cotizacion',
      'agendada_con_cotizacion',
      'pagado',
      'asignada'
    ];

    // Obtener todas las reservas de todos los servicios con los estados permitidos
    const [
      airportTransfers,
      guatapeTours,
      cityTours,
      graffitiTours,
      haciendaNapolesTours,
      occidenteTours,
      parapenteTours,
      atvTours,
      jardinTours,
      coffeeFarmTours,
    ] = await Promise.all([
      prisma.reservaAirportTransfer.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaGuatapeTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaCityTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaGraffitiTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaHaciendaNapolesTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaOccidenteTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaParapenteTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaAtvTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaJardinTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaCoffeeFarmTour.findMany({
        where: {
          estado: { in: estadosPermitidos },
        },
        include: { hotel: true, vehiculo: true },
      }),
    ]);

    // Unificar todas las reservas
    const todasLasReservas = [
      ...airportTransfers.map(r => ({ ...r, tipoServicio: 'airport-transfer', nombreServicio: 'Transporte Aeropuerto' })),
      ...guatapeTours.map(r => ({ ...r, tipoServicio: 'guatape-tour', nombreServicio: 'Tour Guatapé' })),
      ...cityTours.map(r => ({ ...r, tipoServicio: 'city-tour', nombreServicio: 'City Tour' })),
      ...graffitiTours.map(r => ({ ...r, tipoServicio: 'graffiti-tour', nombreServicio: 'Comuna 13 - Graffiti Tour' })),
      ...haciendaNapolesTours.map(r => ({ ...r, tipoServicio: 'hacienda-napoles-tour', nombreServicio: 'Tour Hacienda Nápoles' })),
      ...occidenteTours.map(r => ({ ...r, tipoServicio: 'occidente-tour', nombreServicio: 'Tour Occidente' })),
      ...parapenteTours.map(r => ({ ...r, tipoServicio: 'parapente-tour', nombreServicio: 'Tour Parapente' })),
      ...atvTours.map(r => ({ ...r, tipoServicio: 'atv-tour', nombreServicio: 'Tour ATV' })),
      ...jardinTours.map(r => ({ ...r, tipoServicio: 'jardin-tour', nombreServicio: 'Tour Jardín' })),
      ...coffeeFarmTours.map(r => ({ ...r, tipoServicio: 'coffee-farm-tour', nombreServicio: 'Tour Finca Cafetera' })),
    ];

    // Agrupar por fecha (solo fecha, sin hora)
    const reservasPorFecha: { [key: string]: any[] } = {};

    todasLasReservas.forEach(reserva => {
      let fecha: string;
      const fechaValue = reserva.fecha as Date | string;
      if (fechaValue instanceof Date) {
        fecha = fechaValue.toISOString().split('T')[0];
      } else if (typeof fechaValue === 'string') {
        fecha = fechaValue.split('T')[0];
      } else {
        fecha = String(fechaValue).split('T')[0];
      }
      
      if (!reservasPorFecha[fecha]) {
        reservasPorFecha[fecha] = [];
      }
      
      reservasPorFecha[fecha].push({
        id: reserva.id,
        codigoReserva: reserva.codigoReserva,
        tipoServicio: reserva.tipoServicio,
        nombreServicio: reserva.nombreServicio,
        fecha: fecha,
        hora: reserva.hora instanceof Date 
          ? `${String(reserva.hora.getHours()).padStart(2, '0')}:${String(reserva.hora.getMinutes()).padStart(2, '0')}`
          : reserva.hora,
        estado: reserva.estado,
        numeroPasajeros: reserva.numeroPasajeros,
        nombreContacto: reserva.nombreContacto,
        precioFinal: reserva.precioFinal ? Number(reserva.precioFinal) : null,
      });
    });

    return NextResponse.json({
      success: true,
      data: reservasPorFecha,
    });
  } catch (error) {
    console.error('Error fetching calendar reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las reservas del calendario',
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tipo unificado para todas las reservas
interface ReservaUnificada {
  id: number;
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: Date;
  hora: Date;
  numeroPasajeros: number;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  precioTotal: number;
  precioFinal: number;
  estado: string;
  hotel: string | null;
  conductorAsignado: string | null;
  createdAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const fecha = searchParams.get('fecha');
    const servicio = searchParams.get('servicio');

    // Obtener todas las reservas de todos los servicios
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
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaGuatapeTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaCityTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaGraffitiTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaHaciendaNapolesTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaOccidenteTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaParapenteTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaAtvTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaJardinTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
      prisma.reservaCoffeeFarmTour.findMany({
        include: { hotel: true, vehiculo: true },
      }),
    ]);

    // Unificar todas las reservas con el mismo formato
    const reservasUnificadas: ReservaUnificada[] = [
      ...airportTransfers.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'airport-transfer',
        nombreServicio: 'Transporte Aeropuerto',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        origen: r.origen,
        destino: r.destino,
        vehiculo: r.vehiculo.nombre,
      })),
      ...guatapeTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'guatape-tour',
        nombreServicio: 'Tour Guatapé',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...cityTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'city-tour',
        nombreServicio: 'City Tour',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...graffitiTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'graffiti-tour',
        nombreServicio: 'Comuna 13 - Graffiti Tour',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...haciendaNapolesTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'hacienda-napoles-tour',
        nombreServicio: 'Tour Hacienda Nápoles',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...occidenteTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'occidente-tour',
        nombreServicio: 'Tour Occidente',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...parapenteTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'parapente-tour',
        nombreServicio: 'Tour Parapente',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...atvTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'atv-tour',
        nombreServicio: 'Tour ATV',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...jardinTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'jardin-tour',
        nombreServicio: 'Tour Jardín',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
      ...coffeeFarmTours.map((r) => ({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'coffee-farm-tour',
        nombreServicio: 'Tour Finca Cafetera',
        fecha: r.fecha,
        hora: r.hora,
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioTotal: Number(r.precioTotal),
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        hotel: r.hotel?.nombre || null,
        conductorAsignado: r.conductorAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
      })),
    ];

    // Aplicar filtros
    let reservasFiltradas = reservasUnificadas;

    if (estado) {
      reservasFiltradas = reservasFiltradas.filter((r) => r.estado === estado);
    }

    if (fecha) {
      const fechaFiltro = new Date(fecha);
      reservasFiltradas = reservasFiltradas.filter(
        (r) => r.fecha.toDateString() === fechaFiltro.toDateString()
      );
    }

    if (servicio) {
      reservasFiltradas = reservasFiltradas.filter((r) => r.tipoServicio === servicio);
    }

    // Ordenar por fecha de creación descendente
    reservasFiltradas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return NextResponse.json({
      success: true,
      data: reservasFiltradas,
      total: reservasFiltradas.length,
    });
  } catch (error) {
    console.error('Error fetching all reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las reservas',
      },
      { status: 500 }
    );
  }
}



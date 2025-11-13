import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener todas las reservas de un hotel
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

    // Obtener todas las reservas del hotel de todos los tipos de servicios
    const [
      reservasAirport,
      reservasGuatape,
      reservasCityTour,
      reservasGraffiti,
      reservasHaciendaNapoles,
      reservasOccidente,
      reservasParapente,
      reservasAtv,
      reservasJardin,
      reservasCoffeeFarm,
    ] = await Promise.all([
      prisma.reservaAirportTransfer.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaGuatapeTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaCityTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaGraffitiTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaHaciendaNapolesTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaOccidenteTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaParapenteTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaAtvTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaJardinTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
      prisma.reservaCoffeeFarmTour.findMany({
        where: { hotelId },
        include: { vehiculo: true },
        orderBy: { fecha: 'desc' },
      }),
    ]);

    // Mapear nombres de servicios
    const servicioMap: { [key: string]: string } = {
      'airport-transfer': 'Transporte Aeropuerto',
      'guatape-tour': 'Tour Guatapé',
      'city-tour': 'City Tour',
      'graffiti-tour': 'Comuna 13 - Graffiti Tour',
      'hacienda-napoles-tour': 'Tour Hacienda Nápoles',
      'occidente-tour': 'Tour Occidente',
      'parapente-tour': 'Tour Parapente',
      'atv-tour': 'Tour ATV',
      'jardin-tour': 'Tour Jardín',
      'coffee-farm-tour': 'Tour Finca Cafetera',
    };

    // Combinar y formatear todas las reservas
    const todasLasReservas: any[] = [];

    reservasAirport.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'airport-transfer',
        nombreServicio: servicioMap['airport-transfer'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: r.origen,
        destino: r.destino,
        lugarRecogida: null,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasGuatape.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'guatape-tour',
        nombreServicio: servicioMap['guatape-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasCityTour.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'city-tour',
        nombreServicio: servicioMap['city-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasGraffiti.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'graffiti-tour',
        nombreServicio: servicioMap['graffiti-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasHaciendaNapoles.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'hacienda-napoles-tour',
        nombreServicio: servicioMap['hacienda-napoles-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasOccidente.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'occidente-tour',
        nombreServicio: servicioMap['occidente-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasParapente.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'parapente-tour',
        nombreServicio: servicioMap['parapente-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasAtv.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'atv-tour',
        nombreServicio: servicioMap['atv-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasJardin.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'jardin-tour',
        nombreServicio: servicioMap['jardin-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    reservasCoffeeFarm.forEach((r) => {
      todasLasReservas.push({
        id: r.id,
        codigoReserva: r.codigoReserva,
        tipoServicio: 'coffee-farm-tour',
        nombreServicio: servicioMap['coffee-farm-tour'],
        fecha: r.fecha.toISOString().split('T')[0],
        hora: r.hora.toString().substring(0, 5),
        numeroPasajeros: r.numeroPasajeros,
        nombreContacto: r.nombreContacto,
        telefonoContacto: r.telefonoContacto,
        emailContacto: r.emailContacto,
        precioFinal: Number(r.precioFinal),
        estado: r.estado,
        origen: null,
        destino: null,
        lugarRecogida: r.lugarRecogida,
        createdAt: r.createdAt.toISOString(),
      });
    });

    // Ordenar por fecha de creación (más recientes primero)
    todasLasReservas.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: todasLasReservas,
    });
  } catch (error) {
    console.error('Error fetching hotel reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las reservas del hotel',
      },
      { status: 500 }
    );
  }
}


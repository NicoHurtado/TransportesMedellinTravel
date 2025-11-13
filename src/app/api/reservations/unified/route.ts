import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Tipo unificado para todas las reservas (nuevas y antiguas)
interface ReservaUnificada {
  id: string; // Para nuevas: "new-{id}", para antiguas: "old-{id}"
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: Date | string;
  hora?: Date | string;
  numeroPasajeros?: number;
  nombreContacto: string;
  telefonoContacto?: string;
  emailContacto?: string;
  precioTotal?: number;
  precioFinal?: number;
  estado: string;
  hotel?: string | null;
  conductorAsignado?: string | null;
  vehiculoAsignado?: string | null;
  createdAt: Date | string;
  
  // Campos específicos de nuevas reservas
  origen?: string;
  destino?: string;
  lugarRecogida?: string;
  vehiculo?: string;
  
  // Campos específicos de bd_antigua
  canal?: string;
  idioma?: string;
  numero_contacto?: string;
  cotizacion?: string;
  estado_servicio?: string;
  estado_pago?: string;
  servicio?: string; // Para bd_antigua
  
  // Metadata
  fuente: 'nueva' | 'antigua';
  rawData?: any; // Datos completos para el modal de detalles
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = page * limit;
    const sortOrder = searchParams.get('sortOrder') || 'desc'; // 'desc' = más reciente primero, 'asc' = más antigua primero
    
    // Filtros
    const estado = searchParams.get('estado');
    const fecha = searchParams.get('fecha');
    const fechaDesde = searchParams.get('fechaDesde');
    const fechaHasta = searchParams.get('fechaHasta');
    const servicio = searchParams.get('servicio');
    const canal = searchParams.get('canal');
    const nombre = searchParams.get('nombre');
    const codigo = searchParams.get('codigo');
    const search = searchParams.get('search'); // Búsqueda general

    // Obtener todas las reservas nuevas de todos los servicios
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

    // Unificar todas las reservas nuevas con el mismo formato
    const reservasNuevas: ReservaUnificada[] = [
      ...airportTransfers.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        origen: r.origen,
        destino: r.destino,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...guatapeTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...cityTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...graffitiTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...haciendaNapolesTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...occidenteTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...parapenteTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...atvTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...jardinTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
      ...coffeeFarmTours.map((r) => ({
        id: `new-${r.id}`,
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
        vehiculoAsignado: r.vehiculoAsignado,
        createdAt: r.createdAt,
        lugarRecogida: r.lugarRecogida,
        vehiculo: r.vehiculo.nombre,
        fuente: 'nueva' as const,
        rawData: r,
      })),
    ];

    // Obtener reservas de bd_antigua usando SQL raw
    let reservasAntiguas: ReservaUnificada[] = [];
    try {
      const bdAntiguaData = await prisma.$queryRaw<any[]>`
        SELECT 
          id,
          hora_reserva,
          canal,
          nombre,
          idioma,
          fecha,
          servicio,
          numero_contacto,
          cotizacion,
          estado_servicio,
          estado_pago,
          conductor
        FROM bd_antigua
        ORDER BY fecha DESC NULLS LAST, hora_reserva DESC NULLS LAST
      `;

      reservasAntiguas = bdAntiguaData.map((r: any) => ({
        id: `old-${r.id}`,
        codigoReserva: `ANT-${r.id}`,
        tipoServicio: 'antigua',
        nombreServicio: r.servicio || 'Servicio Antiguo',
        fecha: r.fecha ? new Date(r.fecha) : (r.hora_reserva ? new Date(r.hora_reserva) : new Date()),
        hora: r.hora_reserva ? new Date(r.hora_reserva) : undefined,
        nombreContacto: r.nombre || '',
        telefonoContacto: r.numero_contacto || '',
        estado: r.estado_servicio || 'pendiente',
        canal: r.canal || null,
        idioma: r.idioma || null,
        numero_contacto: r.numero_contacto || null,
        cotizacion: r.cotizacion || null,
        estado_servicio: r.estado_servicio || null,
        estado_pago: r.estado_pago || null,
        conductorAsignado: r.conductor || null,
        servicio: r.servicio || null,
        createdAt: r.hora_reserva ? new Date(r.hora_reserva) : (r.fecha ? new Date(r.fecha) : new Date()),
        fuente: 'antigua' as const,
        rawData: r,
      }));
    } catch (error) {
      console.error('Error fetching bd_antigua:', error);
      // Continuar sin las reservas antiguas si hay error
    }

    // Combinar todas las reservas
    let reservasUnificadas = [...reservasNuevas, ...reservasAntiguas];

    // Aplicar filtros
    if (estado && estado !== 'all') {
      reservasUnificadas = reservasUnificadas.filter((r) => r.estado === estado);
    }

    if (fecha) {
      const fechaFiltro = new Date(fecha);
      reservasUnificadas = reservasUnificadas.filter((r) => {
        const fechaReserva = r.fecha instanceof Date ? r.fecha : new Date(r.fecha);
        return fechaReserva.toDateString() === fechaFiltro.toDateString();
      });
    }

    if (fechaDesde) {
      const fechaDesdeFiltro = new Date(fechaDesde);
      fechaDesdeFiltro.setHours(0, 0, 0, 0);
      reservasUnificadas = reservasUnificadas.filter((r) => {
        const fechaReserva = r.fecha instanceof Date ? r.fecha : new Date(r.fecha);
        return fechaReserva >= fechaDesdeFiltro;
      });
    }

    if (fechaHasta) {
      const fechaHastaFiltro = new Date(fechaHasta);
      fechaHastaFiltro.setHours(23, 59, 59, 999);
      reservasUnificadas = reservasUnificadas.filter((r) => {
        const fechaReserva = r.fecha instanceof Date ? r.fecha : new Date(r.fecha);
        return fechaReserva <= fechaHastaFiltro;
      });
    }

    if (servicio && servicio !== 'all') {
      reservasUnificadas = reservasUnificadas.filter((r) => 
        r.tipoServicio === servicio || r.nombreServicio.toLowerCase().includes(servicio.toLowerCase())
      );
    }

    if (canal && canal !== 'all') {
      reservasUnificadas = reservasUnificadas.filter((r) => 
        r.canal?.toLowerCase().includes(canal.toLowerCase())
      );
    }

    if (nombre && nombre !== '') {
      reservasUnificadas = reservasUnificadas.filter((r) => 
        r.nombreContacto.toLowerCase().includes(nombre.toLowerCase())
      );
    }

    if (codigo && codigo !== '') {
      reservasUnificadas = reservasUnificadas.filter((r) => 
        r.codigoReserva.toLowerCase().includes(codigo.toLowerCase())
      );
    }

    // Búsqueda general
    if (search && search !== '') {
      const searchLower = search.toLowerCase();
      reservasUnificadas = reservasUnificadas.filter((r) => {
        return (
          r.codigoReserva.toLowerCase().includes(searchLower) ||
          r.nombreContacto.toLowerCase().includes(searchLower) ||
          r.nombreServicio.toLowerCase().includes(searchLower) ||
          r.telefonoContacto?.toLowerCase().includes(searchLower) ||
          r.emailContacto?.toLowerCase().includes(searchLower) ||
          r.canal?.toLowerCase().includes(searchLower) ||
          r.origen?.toLowerCase().includes(searchLower) ||
          r.destino?.toLowerCase().includes(searchLower) ||
          r.lugarRecogida?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Ordenar por fecha según el orden seleccionado
    reservasUnificadas.sort((a, b) => {
      const fechaA = a.fecha instanceof Date ? a.fecha : new Date(a.fecha);
      const fechaB = b.fecha instanceof Date ? b.fecha : new Date(b.fecha);
      if (sortOrder === 'desc') {
        // Más reciente primero (descendente)
        return fechaB.getTime() - fechaA.getTime();
      } else {
        // Más antigua primero (ascendente)
        return fechaA.getTime() - fechaB.getTime();
      }
    });

    const total = reservasUnificadas.length;
    const paginatedReservas = reservasUnificadas.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedReservas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching unified reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las reservas unificadas',
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');
    
    // Usar parámetros si están disponibles, sino usar mes actual
    const currentDate = new Date();
    const selectedYear = yearParam ? parseInt(yearParam) : currentDate.getFullYear();
    const selectedMonth = monthParam ? parseInt(monthParam) - 1 : currentDate.getMonth(); // monthParam es 1-12, getMonth() usa 0-11
    
    // Obtener el primer y último día del mes seleccionado
    const startOfMonth = new Date(selectedYear, selectedMonth, 1);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59);
    
    // Formatear rango de fechas para mostrar
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthName = monthNames[selectedMonth];
    const startDateFormatted = `1 de ${monthName}`;
    const endDateFormatted = `${endOfMonth.getDate()} de ${monthName}`;

    // Obtener todas las reservas del mes actual
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
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaGuatapeTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaCityTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaGraffitiTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaHaciendaNapolesTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaOccidenteTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaParapenteTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaAtvTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaJardinTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
      prisma.reservaCoffeeFarmTour.findMany({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        include: { hotel: true },
      }),
    ]);

    // Unificar todas las reservas con información del servicio
    const todasLasReservas = [
      ...airportTransfers.map(r => ({ 
        ...r, 
        tipoServicio: 'airport-transfer', 
        nombreServicio: 'Transporte Aeropuerto',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...guatapeTours.map(r => ({ 
        ...r, 
        tipoServicio: 'guatape-tour', 
        nombreServicio: 'Tour Guatapé',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...cityTours.map(r => ({ 
        ...r, 
        tipoServicio: 'city-tour', 
        nombreServicio: 'City Tour',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...graffitiTours.map(r => ({ 
        ...r, 
        tipoServicio: 'graffiti-tour', 
        nombreServicio: 'Comuna 13 - Graffiti Tour',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...haciendaNapolesTours.map(r => ({ 
        ...r, 
        tipoServicio: 'hacienda-napoles-tour', 
        nombreServicio: 'Tour Hacienda Nápoles',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...occidenteTours.map(r => ({ 
        ...r, 
        tipoServicio: 'occidente-tour', 
        nombreServicio: 'Tour Occidente',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...parapenteTours.map(r => ({ 
        ...r, 
        tipoServicio: 'parapente-tour', 
        nombreServicio: 'Tour Parapente',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...atvTours.map(r => ({ 
        ...r, 
        tipoServicio: 'atv-tour', 
        nombreServicio: 'Tour ATV',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...jardinTours.map(r => ({ 
        ...r, 
        tipoServicio: 'jardin-tour', 
        nombreServicio: 'Tour Jardín',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
      ...coffeeFarmTours.map(r => ({ 
        ...r, 
        tipoServicio: 'coffee-farm-tour', 
        nombreServicio: 'Tour Finca Cafetera',
        precioFinal: r.precioFinal ? Number(r.precioFinal) : 0,
      })),
    ];

    // Calcular KPIs
    const directReservations = todasLasReservas.filter(r => !r.hotelId || r.hotelId === null).length;
    const partnerReservations = todasLasReservas.filter(r => r.hotelId !== null).length;
    const completedReservations = todasLasReservas.filter(r => r.estado === 'completada').length;
    
    // Suma de cotizaciones pagadas netas (solo reservas con estado pagado o completada)
    const paidReservations = todasLasReservas.filter(r => 
      r.estado === 'pagado' || r.estado === 'completada'
    );
    const netQuotesSum = paidReservations.reduce((sum, r) => sum + (r.precioFinal || 0), 0);

    // Gráfica 1: Servicios más solicitados (conteo por servicio)
    const serviciosCount: { [key: string]: number } = {};
    todasLasReservas.forEach(r => {
      serviciosCount[r.nombreServicio] = (serviciosCount[r.nombreServicio] || 0) + 1;
    });
    
    const serviciosMasSolicitados = Object.entries(serviciosCount)
      .map(([nombre, count]) => ({ nombre, count }))
      .sort((a, b) => b.count - a.count);

    // Gráfica 2: Suma de cotizaciones por servicio (solo pagadas)
    const cotizacionesPorServicio: { [key: string]: number } = {};
    paidReservations.forEach(r => {
      cotizacionesPorServicio[r.nombreServicio] = (cotizacionesPorServicio[r.nombreServicio] || 0) + (r.precioFinal || 0);
    });
    
    const cotizacionesPorServicioData = Object.entries(cotizacionesPorServicio)
      .map(([nombre, suma]) => ({ nombre, suma }))
      .sort((a, b) => b.suma - a.suma);

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          directReservations,
          partnerReservations,
          completedReservations,
          netQuotesSum,
        },
        charts: {
          serviciosMasSolicitados,
          cotizacionesPorServicio: cotizacionesPorServicioData,
        },
        monthRange: {
          start: startDateFormatted,
          end: endDateFormatted,
          monthName: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las estadísticas',
      },
      { status: 500 }
    );
  }
}


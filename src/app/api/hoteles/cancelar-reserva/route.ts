import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendStatusUpdateEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const {
      hotelId,
      tipoServicio,
      reservaId,
      codigoReserva,
    } = await request.json();

    if (!hotelId || !tipoServicio || !reservaId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan parámetros requeridos',
        },
        { status: 400 }
      );
    }

    // Obtener el hotel para verificar tarifa de cancelación
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hotel no encontrado',
        },
        { status: 404 }
      );
    }

    // Mapear tipo de servicio a modelo de Prisma
    const modelMap: { [key: string]: any } = {
      'airport-transfer': prisma.reservaAirportTransfer,
      'guatape-tour': prisma.reservaGuatapeTour,
      'city-tour': prisma.reservaCityTour,
      'graffiti-tour': prisma.reservaGraffitiTour,
      'hacienda-napoles-tour': prisma.reservaHaciendaNapolesTour,
      'occidente-tour': prisma.reservaOccidenteTour,
      'parapente-tour': prisma.reservaParapenteTour,
      'atv-tour': prisma.reservaAtvTour,
      'jardin-tour': prisma.reservaJardinTour,
      'coffee-farm-tour': prisma.reservaCoffeeFarmTour,
    };

    const model = modelMap[tipoServicio];

    if (!model) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tipo de servicio no válido',
        },
        { status: 400 }
      );
    }

    // Obtener la reserva antes de actualizar
    const reserva = await model.findUnique({
      where: { id: reservaId },
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

    // Verificar que la reserva pertenece al hotel
    if (reserva.hotelId !== hotelId) {
      return NextResponse.json(
        {
          success: false,
          error: 'La reserva no pertenece a este hotel',
        },
        { status: 403 }
      );
    }

    // Calcular si aplica tarifa de cancelación
    const fechaHoraServicio = new Date(`${reserva.fecha.toISOString().split('T')[0]}T${reserva.hora.toString().substring(0, 5)}`);
    const ahora = new Date();
    const diffMs = fechaHoraServicio.getTime() - ahora.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);
    
    const aplicaTarifa = diffHoras < 24 && diffHoras > 0;
    const tarifaAplicada = aplicaTarifa && hotel.tarifaCancelacion 
      ? Number(hotel.tarifaCancelacion) 
      : 0;

    // Actualizar estado a cancelada
    const reservaActualizada = await model.update({
      where: { id: reservaId },
      data: {
        estado: 'cancelada',
        notasAdmin: reserva.notasAdmin 
          ? `${reserva.notasAdmin}\n\n[Cancelada por hotel] ${ahora.toISOString()}${aplicaTarifa ? ` - Tarifa de cancelación aplicada: ${tarifaAplicada} COP` : ' - Sin tarifa de cancelación'}`
          : `[Cancelada por hotel] ${ahora.toISOString()}${aplicaTarifa ? ` - Tarifa de cancelación aplicada: ${tarifaAplicada} COP` : ' - Sin tarifa de cancelación'}`,
      },
      include: {
        vehiculo: true,
        hotel: true,
      },
    });

    // Enviar email de notificación al cliente
    try {
      const serviceNameMap: { [key: string]: { es: string; en: string } } = {
        'airport-transfer': { es: 'Transporte Aeropuerto', en: 'Airport Transfer' },
        'guatape-tour': { es: 'Tour Guatapé', en: 'Guatapé Tour' },
        'city-tour': { es: 'City Tour', en: 'City Tour' },
        'graffiti-tour': { es: 'Comuna 13 - Graffiti Tour', en: 'Comuna 13 - Graffiti Tour' },
        'hacienda-napoles-tour': { es: 'Tour Hacienda Nápoles', en: 'Hacienda Nápoles Tour' },
        'occidente-tour': { es: 'Tour Occidente', en: 'Occidente Tour' },
        'parapente-tour': { es: 'Tour Parapente', en: 'Paragliding Tour' },
        'atv-tour': { es: 'Tour ATV', en: 'ATV Tour' },
        'jardin-tour': { es: 'Tour Jardín', en: 'Jardín Tour' },
        'coffee-farm-tour': { es: 'Tour Finca Cafetera', en: 'Coffee Farm Tour' },
      };

      const serviceNames = serviceNameMap[tipoServicio] || { es: 'Servicio', en: 'Service' };
      const language = (reserva.idiomaInterfaz as 'es' | 'en') || 'es';
      const nombreServicio = serviceNames[language];

      const { getTrackingUrl } = await import('@/lib/url');
      const trackingUrl = getTrackingUrl(reserva.codigoReserva);

      await sendStatusUpdateEmail({
        to: reserva.emailContacto,
        nombreContacto: reserva.nombreContacto,
        codigoReserva: reserva.codigoReserva,
        nombreServicio,
        estadoAnterior: reserva.estado,
        estadoNuevo: 'cancelada',
        trackingUrl,
        language,
      });

      console.log(`✅ Email de cancelación enviado a ${reserva.emailContacto} (${language})`);
    } catch (emailError) {
      console.error('❌ Error al enviar email de cancelación:', emailError);
      // No fallar la cancelación si el email falla
    }

    return NextResponse.json({
      success: true,
      data: {
        reserva: reservaActualizada,
        aplicaTarifa,
        tarifaAplicada,
        horasAntes: diffHoras,
      },
    });
  } catch (error) {
    console.error('Error canceling reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al cancelar la reserva',
      },
      { status: 500 }
    );
  }
}


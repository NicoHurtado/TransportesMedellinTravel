import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPaymentConfirmationEmail } from '@/lib/email';

// Función auxiliar para obtener datos de reserva y enviar email
async function sendPaymentEmailForReservation(
  reserva: any,
  servicioId: number,
  boldOrderId: string,
  boldTransactionId?: string
) {
  try {
    // Determinar el nombre del servicio
    const serviceNames: { [key: number]: { es: string; en: string } } = {
      1: { es: 'Transporte Aeropuerto', en: 'Airport Transfer' },
      2: { es: 'City Tour', en: 'City Tour' },
      3: { es: 'Tour Guatapé', en: 'Guatapé Tour' },
      4: { es: 'Tour Graffiti', en: 'Graffiti Tour' },
      5: { es: 'Tour Hacienda Nápoles', en: 'Hacienda Nápoles Tour' },
      6: { es: 'Tour Occidente', en: 'Occidente Tour' },
      7: { es: 'Tour Occidente', en: 'Occidente Tour' },
      8: { es: 'Tour Parapente', en: 'Parapente Tour' },
      9: { es: 'Tour ATV', en: 'ATV Tour' },
      10: { es: 'Tour Jardín', en: 'Jardín Tour' },
      11: { es: 'Tour Finca Cafetera', en: 'Coffee Farm Tour' },
    };

    const serviceName = serviceNames[servicioId] || { es: 'Servicio', en: 'Service' };
    const language = (reserva.idiomaInterfaz || 'es') as 'es' | 'en';
    const nombreServicio = language === 'en' ? serviceName.en : serviceName.es;

    // Formatear fecha y hora
    const fecha = reserva.fecha instanceof Date 
      ? reserva.fecha.toISOString().split('T')[0]
      : reserva.fecha;
    const hora = reserva.hora instanceof Date
      ? reserva.hora.toTimeString().split(' ')[0].substring(0, 5)
      : reserva.hora;

    // Construir tracking URL
    const { getTrackingUrl } = await import('@/lib/url');
    const trackingUrl = getTrackingUrl(reserva.codigoReserva);

    // Preparar datos para el email
    const emailData: any = {
      to: reserva.emailContacto,
      nombreContacto: reserva.nombreContacto,
      codigoReserva: reserva.codigoReserva,
      nombreServicio,
      fecha,
      hora,
      numeroPasajeros: reserva.numeroPasajeros,
      precioTotal: Number(reserva.precioFinal || reserva.precioTotal || 0),
      trackingUrl,
      boldOrderId,
      boldTransactionId,
      language,
    };

    // Agregar campos específicos según el tipo de reserva
    if (reserva.lugarRecogida) {
      emailData.lugarRecogida = reserva.lugarRecogida;
    }
    if (reserva.origen && reserva.destino) {
      emailData.origen = reserva.origen;
      emailData.destino = reserva.destino;
    }

    // Enviar email
    const result = await sendPaymentConfirmationEmail(emailData);
    return result;
  } catch (error) {
    console.error('❌ Error al enviar email de confirmación de pago:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { boldOrderId, boldTransactionId, codigoReserva } = await request.json();

    if (!boldOrderId) {
      return NextResponse.json(
        { error: 'Missing boldOrderId' },
        { status: 400 }
      );
    }

    // Si tenemos codigoReserva, buscar directamente
    if (codigoReserva) {
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
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaGuatapeTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaCityTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaGraffitiTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaHaciendaNapolesTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaOccidenteTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaParapenteTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaAtvTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaJardinTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
        prisma.reservaCoffeeFarmTour.findUnique({
          where: { codigoReserva },
          include: { vehiculo: true, hotel: true },
        }),
      ]);

      const reserva = airportTransfer || guatapeTour || cityTour || graffitiTour ||
        haciendaNapolesTour || occidenteTour || parapenteTour || atvTour ||
        jardinTour || coffeeFarmTour;

      if (!reserva) {
        return NextResponse.json(
          { error: 'Reservation not found' },
          { status: 404 }
        );
      }

      // Enviar email
      const servicioId = reserva.servicioId;
      await sendPaymentEmailForReservation(reserva, servicioId, boldOrderId, boldTransactionId);

      return NextResponse.json({
        success: true,
        message: 'Email de confirmación de pago enviado',
        codigoReserva: reserva.codigoReserva,
      });
    }

    // Si no tenemos codigoReserva, buscar por boldOrderId
    // Por ahora retornamos error porque no tenemos el campo en la BD
    return NextResponse.json(
      { error: 'codigoReserva is required. boldOrderId lookup not yet implemented.' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('❌ Error al enviar email de confirmación de pago:', error);
    return NextResponse.json(
      { error: 'Error sending payment confirmation email', message: error.message },
      { status: 500 }
    );
  }
}


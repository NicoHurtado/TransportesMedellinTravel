import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendStatusUpdateEmail, sendQuotationAddedEmail } from '@/lib/email';

export async function PATCH(request: NextRequest) {
  try {
    const { 
      tipoServicio, 
      id, 
      estado, 
      conductorAsignado, 
      vehiculoAsignado, 
      notasAdmin,
      // Campos para actualizar cotización
      precioBase,
      precioVehiculo,
      precioTotal,
      precioFinal,
      comisionHotel,
    } = await request.json();

    // Map service type to its Prisma model
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

    // Get reservation before update to check if status changed
    const reservaAnterior = await model.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        hotel: true,
      },
    });

    if (!reservaAnterior) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva no encontrada',
        },
        { status: 404 }
      );
    }

    const estadoAnterior = reservaAnterior.estado;
    const estadoCambio = estado && estado !== estadoAnterior;
    // Detectar si se agregó cotización: cambio de pendiente_por_cotizacion a agendada_con_cotizacion Y hay precioFinal
    const cotizacionAgregada = estadoAnterior === 'pendiente_por_cotizacion' && 
                                estado === 'agendada_con_cotizacion' && 
                                (precioFinal !== undefined && precioFinal > 0);
    
    console.log('📧 Verificación de envío de correo:', {
      estadoAnterior,
      estadoNuevo: estado,
      estadoCambio,
      cotizacionAgregada,
      precioFinal,
      precioTotal,
      comisionHotel
    });

    // Update reservation
    const updateData: any = {
      ...(estado && { estado }),
      ...(conductorAsignado !== undefined && { conductorAsignado }),
      ...(vehiculoAsignado !== undefined && { vehiculoAsignado }),
      ...(notasAdmin !== undefined && { notasAdmin }),
      // Campos para actualizar cotización
      ...(precioBase !== undefined && { precioBase }),
      ...(precioVehiculo !== undefined && { precioVehiculo }),
      ...(precioTotal !== undefined && { precioTotal }),
      ...(precioFinal !== undefined && { precioFinal }),
      ...(comisionHotel !== undefined && { comisionHotel }),
    };

    const reserva = await model.update({
      where: { id },
      data: updateData,
      include: {
        vehiculo: true,
        hotel: true,
      },
    });

    // Send email if status changed
    if (estadoCambio && reserva.emailContacto) {
      try {
        // Map service type to service name
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

        // Generate tracking URL
        const { getTrackingUrl } = await import('@/lib/url');
        const trackingUrl = getTrackingUrl(reserva.codigoReserva);

        // Si se agregó cotización, enviar email especial
        if (cotizacionAgregada) {
          await sendQuotationAddedEmail({
            to: reserva.emailContacto,
            nombreContacto: reserva.nombreContacto,
            codigoReserva: reserva.codigoReserva,
            nombreServicio,
            precioTotal: Number(reserva.precioTotal || reserva.precioFinal || 0),
            precioFinal: Number(reserva.precioFinal || reserva.precioTotal || 0),
            trackingUrl,
            language,
          });
          console.log(`✅ Email de cotización agregada enviado a ${reserva.emailContacto} (${language})`);
        } else {
          // Email normal de actualización de estado
          await sendStatusUpdateEmail({
            to: reserva.emailContacto,
            nombreContacto: reserva.nombreContacto,
            codigoReserva: reserva.codigoReserva,
            nombreServicio,
            estadoAnterior,
            estadoNuevo: estado,
            trackingUrl,
            language,
          });
          console.log(`✅ Email de actualización de estado enviado a ${reserva.emailContacto} (${language})`);
        }
      } catch (emailError) {
        console.error('❌ Error al enviar email de actualización de estado:', emailError);
        // No fallar la actualización si el email falla
      }
    }

    return NextResponse.json({
      success: true,
      data: reserva,
    });
  } catch (error) {
    console.error('Error updating reservation status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el estado de la reserva',
      },
      { status: 500 }
    );
  }
}



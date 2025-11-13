import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { sendPaymentConfirmationEmail } from '@/lib/email';

// Función auxiliar para buscar reserva por boldOrderId en todas las tablas
async function findReservationByBoldOrderId(boldOrderId: string) {
  // Por ahora, como no tenemos campo boldOrderId en las reservas,
  // vamos a buscar en sessionStorage o crear una tabla de mapeo
  // Por ahora retornamos null y manejamos el caso
  // TODO: Agregar campo boldOrderId a las reservas o crear tabla de mapeo
  
  // Buscar en todas las tablas usando el orderId como parte del codigoReserva
  // o crear una búsqueda más específica cuando tengamos el campo
  
  return null;
}

// Función auxiliar para obtener datos de reserva y enviar email
async function sendPaymentEmailForReservation(
  reserva: any,
  boldOrderId: string,
  boldTransactionId?: string
) {
  try {
    // Determinar el tipo de servicio y obtener nombre
    const servicioId = reserva.servicioId;
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
    await sendPaymentConfirmationEmail(emailData);
    console.log(`✅ Email de confirmación de pago enviado para reserva ${reserva.codigoReserva}`);
  } catch (error) {
    console.error('❌ Error al enviar email de confirmación de pago:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📥 Webhook de Bold recibido:', {
      event: body.event,
      orderId: body.order_id,
      transactionId: body.transaction_id,
      status: body.payment_status,
      timestamp: new Date().toISOString()
    });

    // Validar que venga el orderId
    const boldOrderId = body.order_id;
    if (!boldOrderId) {
      console.error('❌ Webhook sin order_id');
      return NextResponse.json(
        { error: 'Missing order_id' },
        { status: 400 }
      );
    }

    // Validar la firma del webhook (si Bold la envía)
    // Por ahora solo validamos que venga el orderId
    // TODO: Implementar validación de firma según documentación de Bold

    const paymentStatus = body.payment_status;
    const transactionId = body.transaction_id;

    console.log('✅ Webhook procesado:', {
      boldOrderId,
      transactionId,
      paymentStatus,
      action: paymentStatus === 'approved' ? 'Actualizar reserva y enviar email' : 'Solo registrar'
    });

    // Si el pago fue aprobado, buscar la reserva y actualizar el estado
    if (paymentStatus === 'approved') {
      // Buscar el codigoReserva usando el boldOrderId
      // Por ahora, el webhook no tiene acceso a sessionStorage/localStorage del cliente
      // Por eso necesitamos que el cliente actualice el estado cuando regrese
      // O implementar una tabla de mapeo boldOrderId -> codigoReserva en la BD
      
      console.log('💳 Pago aprobado - El estado se actualizará cuando el cliente regrese a /pagos/resultado');
    } else if (paymentStatus === 'rejected') {
      // Si el pago fue rechazado, mantener el estado en "agendada_con_cotizacion"
      console.log('❌ Pago rechazado - La reserva permanecerá en estado "agendada_con_cotizacion"');
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook recibido correctamente',
      orderId: boldOrderId,
      status: paymentStatus
    });

  } catch (error: any) {
    console.error('❌ Error procesando webhook de Bold:', error);
    return NextResponse.json(
      { error: 'Error processing webhook', message: error.message },
      { status: 500 }
    );
  }
}

// GET para pruebas (Bold puede hacer GET para verificar que el endpoint existe)
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'Bold webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}


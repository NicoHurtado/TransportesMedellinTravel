import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateReservationCode } from '@/lib/generateCode';
import { sendConfirmationEmail } from '@/lib/email';
import { parseTimeToDate } from '@/lib/parseTime';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      lugarRecogida,
      municipio,
      fecha,
      hora,
      numeroPasajeros,
      idiomaTour,
      quiereGuia,
      precioGuia,
      paseoBote,
      precioBote,
      cantidadAlmuerzos,
      precioAlmuerzos,
      vehiculoId,
      precioBase,
      precioVehiculo,
      precioServiciosAdicionales,
      precioTotal,
      comisionHotel,
      precioFinal,
      nombreContacto,
      telefonoContacto,
      emailContacto,
      personasAsistentes,
      peticionesEspeciales,
      hotelId,
      language,
    } = body;

    const codigoReserva = generateReservationCode();

    const reserva = await prisma.reservaGuatapeTour.create({
      data: {
        codigoReserva,
        servicioId: 3, // ID del servicio Guatapé Tour
        hotelId: hotelId || null,
        lugarRecogida,
        municipio: municipio || null,
        fecha: new Date(fecha),
        hora: parseTimeToDate(hora),
        numeroPasajeros,
        idiomaInterfaz: language || 'es', // Guardar idioma de la interfaz
        idiomaTour,
        quiereGuia: quiereGuia || false,
        precioGuia: precioGuia || 0,
        paseoBote,
        precioBote: precioBote || 0,
        cantidadAlmuerzos: cantidadAlmuerzos || 0,
        precioAlmuerzos: precioAlmuerzos || 0,
        vehiculoId,
        precioBase,
        precioVehiculo,
        precioServiciosAdicionales: precioServiciosAdicionales || 0,
        precioTotal,
        comisionHotel: comisionHotel || 0,
        precioFinal,
        nombreContacto,
        telefonoContacto,
        emailContacto: emailContacto?.toLowerCase().trim() || emailContacto, // Normalizar email a lowercase
        personasAsistentes,
        peticionesEspeciales,
        estado: 'agendada_con_cotizacion', // Estado inicial cuando se crea la reserva antes del pago
      },
      include: {
        vehiculo: true,
        hotel: true,
      },
    });

    // Generar URL de tracking
    const { getTrackingUrl } = await import('@/lib/url');
    const trackingUrl = getTrackingUrl(codigoReserva);

    // Enviar email de confirmación
    try {
      const serviceName = language === 'en' ? 'Guatapé Tour' : 'Tour Guatapé';
      await sendConfirmationEmail({
        to: emailContacto,
        codigoReserva,
        nombreContacto,
        nombreServicio: serviceName,
        fecha: fecha,
        hora: hora,
        numeroPasajeros,
        precioTotal: Number(precioFinal),
        lugarRecogida,
        trackingUrl,
        language: language || 'es',
      });
      console.log(`✅ Email de confirmación enviado a ${emailContacto} (${language || 'es'})`);
    } catch (emailError) {
      console.error('❌ Error al enviar email de confirmación:', emailError);
      // No fallar la reserva si el email falla
    }

    return NextResponse.json(
      {
        success: true,
        data: reserva,
        trackingUrl: `/tracking/${codigoReserva}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating Guatapé tour reservation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la reserva',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const fecha = searchParams.get('fecha');

    const where: any = {};
    
    if (estado) {
      where.estado = estado;
    }
    
    if (fecha) {
      where.fecha = new Date(fecha);
    }

    const reservas = await prisma.reservaGuatapeTour.findMany({
      where,
      include: {
        vehiculo: true,
        hotel: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: reservas,
    });
  } catch (error) {
    console.error('Error fetching Guatapé tour reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las reservas',
      },
      { status: 500 }
    );
  }
}



import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateReservationCode } from '@/lib/generateCode';
import { sendConfirmationEmail } from '@/lib/email';
import { parseTimeToDate } from '@/lib/parseTime';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('======= DATOS RECIBIDOS EN API =======');
    console.log('personasAsistentes:', JSON.stringify(body.personasAsistentes, null, 2));
    console.log('=====================================');
    
    const {
      direccion,
      aeropuerto,
      numeroVuelo,
      origen,
      destino,
      municipio,
      fecha,
      hora,
      numeroPasajeros,
      vehiculoId,
      precioVehiculo,
      precioTotal,
      comisionHotel,
      precioFinal,
      nombreContacto,
      telefonoContacto,
      emailContacto,
      personasAsistentes,
      notasCliente,
      hotelId,
      language,
    } = body;

    // Generar código único de reserva
    const codigoReserva = generateReservationCode();

    // Debug: Verificar valores de precio
    console.log('======= PRECIOS RECIBIDOS =======');
    console.log('precioTotal:', precioTotal);
    console.log('precioFinal:', precioFinal);
    console.log('comisionHotel:', comisionHotel);
    console.log('estado calculado:', precioFinal === 0 || precioFinal === null ? 'pendiente_por_cotizacion' : 'agendada_con_cotizacion');
    console.log('================================');

    // Crear reserva en la base de datos
    const reserva = await prisma.reservaAirportTransfer.create({
      data: {
        codigoReserva,
        servicioId: 1, // ID del servicio Airport Transfer
        hotelId: hotelId || null,
        direccion,
        aeropuerto,
        numeroVuelo,
        origen,
        destino,
        municipio: municipio || null,
        fecha: new Date(fecha),
        hora: parseTimeToDate(hora),
        numeroPasajeros,
        idiomaInterfaz: language || 'es', // Guardar idioma de la interfaz
        vehiculoId,
        precioVehiculo,
        precioTotal,
        comisionHotel: comisionHotel || 0,
        precioFinal,
        nombreContacto,
        telefonoContacto,
        emailContacto: emailContacto?.toLowerCase().trim() || emailContacto, // Normalizar email a lowercase
        personasAsistentes: personasAsistentes || [],
        notasCliente: notasCliente || null,
        estado: precioFinal === 0 || precioFinal === null ? 'pendiente_por_cotizacion' : 'agendada_con_cotizacion',
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
      const serviceName = language === 'en' ? 'Airport Transfer' : 'Transporte Aeropuerto';
      await sendConfirmationEmail({
        to: emailContacto,
        codigoReserva,
        nombreContacto,
        nombreServicio: serviceName,
        fecha: fecha,
        hora: hora,
        numeroPasajeros,
        precioTotal: Number(precioFinal),
        origen,
        destino,
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
    console.error('Error creating airport transfer reservation:', error);
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

    const reservas = await prisma.reservaAirportTransfer.findMany({
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
    console.error('Error fetching airport transfer reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las reservas',
      },
      { status: 500 }
    );
  }
}



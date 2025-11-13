import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateReservationCode } from '@/lib/generateCode';
import { parseTimeToDate } from '@/lib/parseTime';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      lugarRecogida,
      fecha,
      hora,
      numeroPasajeros,
      idiomaTour,
      quiereGuia,
      precioGuia,
      vehiculoId,
      precioBase,
      precioVehiculo,
      precioTotal,
      comisionHotel,
      precioFinal,
      nombreContacto,
      telefonoContacto,
      emailContacto,
      personasAsistentes,
      peticionesEspeciales,
      hotelId,
    } = body;

    const codigoReserva = generateReservationCode();

    const reserva = await prisma.reservaCityTour.create({
      data: {
        codigoReserva,
        servicioId: 5,
        hotelId: hotelId || null,
        lugarRecogida,
        fecha: new Date(fecha),
        hora: parseTimeToDate(hora),
        numeroPasajeros,
        idiomaTour,
        quiereGuia: quiereGuia || false,
        precioGuia: precioGuia || 0,
        vehiculoId,
        precioBase,
        precioVehiculo,
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

    return NextResponse.json(
      {
        success: true,
        data: reserva,
        trackingUrl: `/tracking/${codigoReserva}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating City Tour reservation:', error);
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

    const where: any = {};
    if (estado) where.estado = estado;

    const reservas = await prisma.reservaCityTour.findMany({
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
    console.error('Error fetching City Tour reservations:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las reservas',
      },
      { status: 500 }
    );
  }
}



import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Crear una nueva calificación
export async function POST(request: NextRequest) {
  try {
    const { nombreCliente, estrellas, nota } = await request.json();

    // Validaciones
    if (!nombreCliente || !estrellas) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan campos requeridos: nombreCliente, estrellas',
        },
        { status: 400 }
      );
    }

    if (estrellas < 1 || estrellas > 5) {
      return NextResponse.json(
        {
          success: false,
          error: 'Las estrellas deben estar entre 1 y 5',
        },
        { status: 400 }
      );
    }

    // Crear la calificación (sin código de reserva)
    const calificacion = await prisma.calificacion.create({
      data: {
        codigoReserva: '', // Código vacío ya que no es requerido
        nombreCliente,
        estrellas,
        nota: nota || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: calificacion,
    });
  } catch (error: any) {
    console.error('Error creating calificación:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear la calificación',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET - Obtener todas las calificaciones (para el panel)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const codigoReserva = searchParams.get('codigoReserva');

    const where: any = {};
    if (codigoReserva) {
      where.codigoReserva = codigoReserva;
    }

    const calificaciones = await prisma.calificacion.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: calificaciones,
    });
  } catch (error: any) {
    console.error('Error fetching calificaciones:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener las calificaciones',
        details: error.message,
      },
      { status: 500 }
    );
  }
}


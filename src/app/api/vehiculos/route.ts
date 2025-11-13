import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener todos los vehículos
export async function GET(request: NextRequest) {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: vehiculos.map((v) => ({
        id: v.id,
        nombre: v.nombre,
        capacidadMin: v.capacidadMin,
        capacidadMax: v.capacidadMax,
        imagenUrl: v.imagenUrl,
        tipo: v.tipo,
        activo: v.activo,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los vehículos',
      },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, capacidadMin, capacidadMax, imagenUrl, tipo } = body;

    if (!nombre || !capacidadMin || !capacidadMax) {
      return NextResponse.json(
        {
          success: false,
          error: 'Nombre y capacidad son requeridos',
        },
        { status: 400 }
      );
    }

    const vehiculo = await prisma.vehiculo.create({
      data: {
        nombre,
        capacidadMin: parseInt(capacidadMin),
        capacidadMax: parseInt(capacidadMax),
        imagenUrl: imagenUrl || null,
        tipo: tipo || null,
        activo: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: vehiculo.id,
          nombre: vehiculo.nombre,
          capacidadMin: vehiculo.capacidadMin,
          capacidadMax: vehiculo.capacidadMax,
          imagenUrl: vehiculo.imagenUrl,
          tipo: vehiculo.tipo,
          activo: vehiculo.activo,
          createdAt: vehiculo.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear el vehículo',
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT - Actualizar un precio adicional
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceCodigo, precioId, precio } = body;

    if (!serviceCodigo || !precioId || precio === undefined) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    // Map de servicios a sus tablas de precios adicionales
    const precioModelMap: Record<string, any> = {
      'guatape-tour': prisma.precioAdicionalGuatape,
    };

    const model = precioModelMap[serviceCodigo];
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado o no tiene precios adicionales' },
        { status: 404 }
      );
    }

    // Actualizar el precio
    const updatedPrecio = await model.update({
      where: { id: precioId },
      data: { precio: Number(precio) },
    });

    return NextResponse.json({
      success: true,
      data: updatedPrecio,
    });
  } catch (error) {
    console.error('Error updating additional price:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el precio adicional' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo precio adicional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceCodigo, tipo, rango, precio } = body;

    if (!serviceCodigo || !tipo || precio === undefined) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const precioModelMap: Record<string, any> = {
      'guatape-tour': prisma.precioAdicionalGuatape,
    };

    const model = precioModelMap[serviceCodigo];
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado o no tiene precios adicionales' },
        { status: 404 }
      );
    }

    const newPrecio = await model.create({
      data: {
        tipo,
        rango: rango || null,
        precio: Number(precio),
        activo: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newPrecio,
    });
  } catch (error) {
    console.error('Error creating additional price:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el precio adicional' },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar un precio adicional
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceCodigo = searchParams.get('serviceCodigo');
    const precioId = searchParams.get('precioId');

    if (!serviceCodigo || !precioId) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const precioModelMap: Record<string, any> = {
      'guatape-tour': prisma.precioAdicionalGuatape,
    };

    const model = precioModelMap[serviceCodigo];
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado o no tiene precios adicionales' },
        { status: 404 }
      );
    }

    const updatedPrecio = await model.update({
      where: { id: Number(precioId) },
      data: { activo: false },
    });

    return NextResponse.json({
      success: true,
      data: updatedPrecio,
    });
  } catch (error) {
    console.error('Error deleting additional price:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el precio adicional' },
      { status: 500 }
    );
  }
}


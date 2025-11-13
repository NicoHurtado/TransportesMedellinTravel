import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PUT - Actualizar un precio de vehículo
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

    // Map de servicios a sus tablas de precios de vehículos
    const precioModelMap: Record<string, any> = {
      'airport-transfer': prisma.precioAirportTransfer,
      'guatape-tour': prisma.precioVehiculoGuatape,
      'city-tour': prisma.precioVehiculoCityTour,
      'graffiti-tour': prisma.precioVehiculoGraffitiTour,
      'hacienda-napoles-tour': prisma.precioVehiculoHaciendaNapoles,
      'occidente-tour': prisma.precioVehiculoOccidente,
      'parapente-tour': prisma.precioVehiculoParapente,
      'atv-tour': prisma.precioVehiculoAtv,
      'jardin-tour': prisma.precioVehiculoJardin,
      'coffee-farm-tour': prisma.precioVehiculoCoffeeFarm,
    };

    const model = precioModelMap[serviceCodigo];
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
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
    console.error('Error updating vehicle price:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar el precio' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo precio de vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceCodigo, vehiculoId, pasajerosMin, pasajerosMax, precio } = body;

    if (!serviceCodigo || !vehiculoId || !pasajerosMin || !pasajerosMax || precio === undefined) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos' },
        { status: 400 }
      );
    }

    const precioModelMap: Record<string, any> = {
      'airport-transfer': prisma.precioAirportTransfer,
      'guatape-tour': prisma.precioVehiculoGuatape,
      'city-tour': prisma.precioVehiculoCityTour,
      'graffiti-tour': prisma.precioVehiculoGraffitiTour,
      'hacienda-napoles-tour': prisma.precioVehiculoHaciendaNapoles,
      'occidente-tour': prisma.precioVehiculoOccidente,
      'parapente-tour': prisma.precioVehiculoParapente,
      'atv-tour': prisma.precioVehiculoAtv,
      'jardin-tour': prisma.precioVehiculoJardin,
      'coffee-farm-tour': prisma.precioVehiculoCoffeeFarm,
    };

    const model = precioModelMap[serviceCodigo];
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
        { status: 404 }
      );
    }

    const newPrecio = await model.create({
      data: {
        vehiculoId: Number(vehiculoId),
        pasajerosMin: Number(pasajerosMin),
        pasajerosMax: Number(pasajerosMax),
        precio: Number(precio),
        activo: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: newPrecio,
    });
  } catch (error) {
    console.error('Error creating vehicle price:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el precio' },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar un precio de vehículo
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
      'airport-transfer': prisma.precioAirportTransfer,
      'guatape-tour': prisma.precioVehiculoGuatape,
      'city-tour': prisma.precioVehiculoCityTour,
      'graffiti-tour': prisma.precioVehiculoGraffitiTour,
      'hacienda-napoles-tour': prisma.precioVehiculoHaciendaNapoles,
      'occidente-tour': prisma.precioVehiculoOccidente,
      'parapente-tour': prisma.precioVehiculoParapente,
      'atv-tour': prisma.precioVehiculoAtv,
      'jardin-tour': prisma.precioVehiculoJardin,
      'coffee-farm-tour': prisma.precioVehiculoCoffeeFarm,
    };

    const model = precioModelMap[serviceCodigo];
    if (!model) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado' },
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
    console.error('Error deleting vehicle price:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar el precio' },
      { status: 500 }
    );
  }
}


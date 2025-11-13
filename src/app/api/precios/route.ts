import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Actualizar o crear precio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, precio } = body;

    let resultado;

    switch (tipo) {
      case 'airport':
        resultado = await prisma.precioAirportTransfer.upsert({
          where: {
            vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
              vehiculoId: precio.vehiculoId,
              pasajerosMin: precio.pasajerosMin,
              pasajerosMax: precio.pasajerosMax,
              vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            },
          },
          update: {
            precio: precio.precio,
            activo: precio.activo ?? true,
          },
          create: {
            vehiculoId: precio.vehiculoId,
            pasajerosMin: precio.pasajerosMin,
            pasajerosMax: precio.pasajerosMax,
            precio: precio.precio,
            vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            activo: precio.activo ?? true,
          },
        });
        break;

      case 'guatape-vehiculo':
        resultado = await prisma.precioVehiculoGuatape.upsert({
          where: {
            vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
              vehiculoId: precio.vehiculoId,
              pasajerosMin: precio.pasajerosMin,
              pasajerosMax: precio.pasajerosMax,
              vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            },
          },
          update: {
            precio: precio.precio,
            activo: precio.activo ?? true,
          },
          create: {
            vehiculoId: precio.vehiculoId,
            pasajerosMin: precio.pasajerosMin,
            pasajerosMax: precio.pasajerosMax,
            precio: precio.precio,
            vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            activo: precio.activo ?? true,
          },
        });
        break;

      case 'guatape-base':
        resultado = await prisma.precioGuatapeTour.upsert({
          where: { id: precio.id || 1 },
          update: {
            precioBasePorPersona: precio.precioBasePorPersona,
            activo: precio.activo ?? true,
          },
          create: {
            precioBasePorPersona: precio.precioBasePorPersona,
            activo: precio.activo ?? true,
          },
        });
        break;

      case 'city-tour':
        resultado = await prisma.precioVehiculoCityTour.upsert({
          where: {
            vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
              vehiculoId: precio.vehiculoId,
              pasajerosMin: precio.pasajerosMin,
              pasajerosMax: precio.pasajerosMax,
              vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            },
          },
          update: {
            precio: precio.precio,
            activo: precio.activo ?? true,
          },
          create: {
            vehiculoId: precio.vehiculoId,
            pasajerosMin: precio.pasajerosMin,
            pasajerosMax: precio.pasajerosMax,
            precio: precio.precio,
            vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            activo: precio.activo ?? true,
          },
        });
        break;

      case 'graffiti':
        resultado = await prisma.precioVehiculoGraffitiTour.upsert({
          where: {
            vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
              vehiculoId: precio.vehiculoId,
              pasajerosMin: precio.pasajerosMin,
              pasajerosMax: precio.pasajerosMax,
              vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            },
          },
          update: {
            precio: precio.precio,
            activo: precio.activo ?? true,
          },
          create: {
            vehiculoId: precio.vehiculoId,
            pasajerosMin: precio.pasajerosMin,
            pasajerosMax: precio.pasajerosMax,
            precio: precio.precio,
            vigenteDesde: new Date(precio.vigenteDesde || new Date()),
            activo: precio.activo ?? true,
          },
        });
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Tipo de precio no válido',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el precio',
      },
      { status: 500 }
    );
  }
}


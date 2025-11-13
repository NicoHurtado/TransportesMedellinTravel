import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener todos los servicios con sus precios
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    
    // Obtener servicios
    let servicios;
    if (hotelId) {
      // Si hay hotelId, filtrar solo servicios activos para ese hotel
      const hotelIdNum = parseInt(hotelId);
      console.log('🏨 Filtrando servicios para hotelId:', hotelIdNum);
      
      servicios = await prisma.servicio.findMany({
        where: {
          activo: true,
          hotelesActivos: {
            some: {
              hotelId: hotelIdNum,
              activo: true,
            },
          },
        },
        include: {
          hotelesActivos: {
            where: {
              hotelId: hotelIdNum,
              activo: true,
            },
          },
        },
        orderBy: {
          ordenDisplay: 'asc',
        },
      });
      
      console.log(`✅ Servicios encontrados para hotel ${hotelIdNum}:`, servicios.length);
      console.log('📋 Servicios:', servicios.map(s => ({ id: s.id, codigo: s.codigo, nombre: s.nombreEs })));
    } else {
      // Sin hotelId, obtener todos los servicios activos
      servicios = await prisma.servicio.findMany({
        where: {
          activo: true,
        },
        orderBy: {
          ordenDisplay: 'asc',
        },
      });
    }

    // Obtener vehículos
    const vehiculos = await prisma.vehiculo.findMany({
      orderBy: {
        capacidadMin: 'asc',
      },
    });

    // Obtener precios por tipo de servicio
    const [
      preciosAirport,
      preciosGuatape,
      preciosGuatapeVehiculos,
      preciosGuatapeAdicionales,
      preciosCityTour,
      preciosGraffiti,
      preciosHaciendaNapoles,
      preciosOccidente,
      preciosParapente,
      preciosAtv,
      preciosJardin,
      preciosCoffeeFarm,
    ] = await Promise.all([
      prisma.precioAirportTransfer.findMany({ where: { activo: true } }),
      prisma.precioGuatapeTour.findMany({ where: { activo: true } }),
      prisma.precioVehiculoGuatape.findMany({ where: { activo: true } }),
      prisma.precioAdicionalGuatape.findMany({ where: { activo: true } }),
      prisma.precioVehiculoCityTour.findMany({ where: { activo: true } }),
      prisma.precioVehiculoGraffitiTour.findMany({ where: { activo: true } }),
      prisma.precioVehiculoHaciendaNapoles.findMany({ where: { activo: true } }),
      prisma.precioVehiculoOccidente.findMany({ where: { activo: true } }),
      prisma.precioVehiculoParapente.findMany({ where: { activo: true } }),
      prisma.precioVehiculoAtv.findMany({ where: { activo: true } }),
      prisma.precioVehiculoJardin.findMany({ where: { activo: true } }),
      prisma.precioVehiculoCoffeeFarm.findMany({ where: { activo: true } }),
    ]);

    // Obtener precios dinámicos de servicios nuevos (almacenados en configuración)
    const preciosDinamicos: Record<string, any[]> = {};
    servicios.forEach((servicio) => {
      const config = servicio.configuracion as any;
      if (config && config.preciosVehiculos && Array.isArray(config.preciosVehiculos)) {
        preciosDinamicos[servicio.codigo] = config.preciosVehiculos.map((p: any) => {
          // Buscar el vehículo para obtener sus capacidades reales
          const vehiculo = vehiculos.find((v) => v.id === p.vehiculoId);
          return {
            id: p.vehiculoId, // Usar vehiculoId como ID temporal
            vehiculoId: p.vehiculoId,
            pasajerosMin: vehiculo ? vehiculo.capacidadMin : p.pasajerosMin,
            pasajerosMax: vehiculo ? vehiculo.capacidadMax : p.pasajerosMax,
            precio: p.precio,
            activo: true,
          };
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        servicios,
        vehiculos,
        precios: {
          airport: preciosAirport,
          guatape: preciosGuatape,
          guatapeVehiculos: preciosGuatapeVehiculos,
          guatapeAdicionales: preciosGuatapeAdicionales,
          cityTour: preciosCityTour,
          graffiti: preciosGraffiti,
          haciendaNapoles: preciosHaciendaNapoles,
          occidente: preciosOccidente,
          parapente: preciosParapente,
          atv: preciosAtv,
          jardin: preciosJardin,
          coffeeFarm: preciosCoffeeFarm,
          dinamicos: preciosDinamicos, // Precios de servicios nuevos
        },
      },
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los servicios',
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo servicio
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      codigo,
      nombreEs,
      nombreEn,
      descripcionCortaEs,
      descripcionCortaEn,
      descripcionCompletaEs,
      descripcionCompletaEn,
      imagenUrl,
      tipo,
      activo,
      ordenDisplay,
      configuracion,
    } = body;

    // Validar campos requeridos
    if (!codigo || !nombreEs || !nombreEn || !tipo) {
      return NextResponse.json(
        { success: false, error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el código no exista
    const existingService = await prisma.servicio.findUnique({
      where: { codigo },
    });

    if (existingService) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un servicio con ese código' },
        { status: 400 }
      );
    }

    // Crear el servicio
    const nuevoServicio = await prisma.servicio.create({
      data: {
        codigo,
        nombreEs,
        nombreEn,
        descripcionCortaEs,
        descripcionCortaEn,
        descripcionCompletaEs,
        descripcionCompletaEn,
        imagenUrl: imagenUrl || '/medellin.jpg', // Imagen por defecto
        tipo,
        tablaReservas: `reservas_${codigo.replace(/-/g, '_')}`,
        activo: activo !== undefined ? activo : true,
        ordenDisplay: ordenDisplay || 999,
        configuracion: configuracion || {},
      },
    });

    return NextResponse.json({
      success: true,
      data: nuevoServicio,
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear el servicio' },
      { status: 500 }
    );
  }
}

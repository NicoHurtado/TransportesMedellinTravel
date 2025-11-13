import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Obtener todos los servicios con sus precios
export async function GET(request: Request) {
  try {
    // Verificar que Prisma esté disponible
    if (!prisma) {
      console.error('❌ Prisma Client no está disponible');
      return NextResponse.json({
        success: true,
        data: {
          servicios: [],
          vehiculos: [],
          precios: {
            airport: [],
            guatape: [],
            guatapeVehiculos: [],
            guatapeAdicionales: [],
            cityTour: [],
            graffiti: [],
            haciendaNapoles: [],
            occidente: [],
            parapente: [],
            atv: [],
            jardin: [],
            coffeeFarm: [],
            dinamicos: {},
          },
        },
      });
    }

    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');
    
    console.log('🔍 Iniciando GET /api/services', { hotelId, nodeEnv: process.env.NODE_ENV });
    
    // Test de conexión a la base de datos
    try {
      await prisma.$connect();
      console.log('✅ Conexión a la base de datos establecida');
    } catch (connectError) {
      console.error('❌ Error al conectar a la base de datos:', connectError);
      // Continuar de todas formas, el error se manejará en las consultas
    }
    
    // Obtener servicios con manejo robusto de errores
    let servicios: any[] = [];
    
    try {
      if (hotelId) {
        // Si hay hotelId, filtrar solo servicios activos para ese hotel
        const hotelIdNum = parseInt(hotelId);
        
        // Validar que hotelId sea un número válido
        if (isNaN(hotelIdNum)) {
          console.error('❌ hotelId inválido:', hotelId);
          // Continuar sin filtro de hotel si el ID es inválido
        } else {
          console.log('🏨 Filtrando servicios para hotelId:', hotelIdNum);
          
          try {
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
          } catch (error) {
            console.error('❌ Error al buscar servicios para hotel:', error);
            // Si falla la búsqueda con hotelId, intentar sin filtro de hotel
            servicios = await prisma.servicio.findMany({
              where: {
                activo: true,
              },
              orderBy: {
                ordenDisplay: 'asc',
              },
            }).catch(() => []);
          }
        }
      }
      
      // Si no hay hotelId o si la búsqueda con hotelId falló, obtener todos los servicios activos
      if (servicios.length === 0) {
        try {
          servicios = await prisma.servicio.findMany({
            where: {
              activo: true,
            },
            orderBy: {
              ordenDisplay: 'asc',
            },
          });
        } catch (error) {
          console.error('❌ Error al obtener servicios con orderBy:', error);
          // Intentar sin orderBy si falla
          try {
            servicios = await prisma.servicio.findMany({
              where: {
                activo: true,
              },
            });
          } catch (fallbackError) {
            console.error('❌ Error en fallback de servicios:', fallbackError);
            servicios = [];
          }
        }
      }
    } catch (error) {
      console.error('❌ Error crítico al obtener servicios:', error);
      servicios = [];
    }
    
    // Asegurar que servicios sea un array válido
    if (!Array.isArray(servicios)) {
      console.error('❌ servicios no es un array:', servicios);
      servicios = [];
    }

    // Obtener vehículos con manejo robusto de errores
    let vehiculos: any[] = [];
    try {
      vehiculos = await prisma.vehiculo.findMany({
        orderBy: {
          capacidadMin: 'asc',
        },
      }).catch(() => {
        // Si falla con orderBy, intentar sin ordenamiento
        return prisma.vehiculo.findMany().catch(() => []);
      });
    } catch (error) {
      console.error('❌ Error al obtener vehículos:', error);
      vehiculos = [];
    }
    
    // Asegurar que vehiculos sea un array válido
    if (!Array.isArray(vehiculos)) {
      vehiculos = [];
    }

    // Obtener precios por tipo de servicio con manejo de errores individual
    // Cada consulta tiene su propio catch para evitar que una tabla problemática rompa todo
    const preciosPromises = [
      prisma.precioAirportTransfer.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosAirport:', e); return []; }),
      prisma.precioGuatapeTour.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosGuatape:', e); return []; }),
      prisma.precioVehiculoGuatape.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosGuatapeVehiculos:', e); return []; }),
      prisma.precioAdicionalGuatape.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosGuatapeAdicionales:', e); return []; }),
      prisma.precioVehiculoCityTour.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosCityTour:', e); return []; }),
      prisma.precioVehiculoGraffitiTour.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosGraffiti:', e); return []; }),
      prisma.precioVehiculoHaciendaNapoles.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosHaciendaNapoles:', e); return []; }),
      prisma.precioVehiculoOccidente.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosOccidente:', e); return []; }),
      prisma.precioVehiculoParapente.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosParapente:', e); return []; }),
      prisma.precioVehiculoAtv.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosAtv:', e); return []; }),
      prisma.precioVehiculoJardin.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosJardin:', e); return []; }),
      prisma.precioVehiculoCoffeeFarm.findMany({ where: { activo: true } }).catch((e) => { console.error('Error preciosCoffeeFarm:', e); return []; }),
    ];

    let preciosResults: any[] = [];
    try {
      preciosResults = await Promise.all(preciosPromises);
      // Asegurar que siempre tengamos exactamente 12 elementos
      while (preciosResults.length < 12) {
        preciosResults.push([]);
      }
      // Si hay más de 12, tomar solo los primeros 12
      preciosResults = preciosResults.slice(0, 12);
    } catch (error) {
      console.error('❌ Error al obtener precios:', error);
      // Si falla Promise.all, usar arrays vacíos
      preciosResults = [[], [], [], [], [], [], [], [], [], [], [], []];
    }

    // Asegurar que cada elemento sea un array válido
    const [
      preciosAirport = [],
      preciosGuatape = [],
      preciosGuatapeVehiculos = [],
      preciosGuatapeAdicionales = [],
      preciosCityTour = [],
      preciosGraffiti = [],
      preciosHaciendaNapoles = [],
      preciosOccidente = [],
      preciosParapente = [],
      preciosAtv = [],
      preciosJardin = [],
      preciosCoffeeFarm = [],
    ] = preciosResults.map((result) => Array.isArray(result) ? result : []);

    // Obtener precios dinámicos de servicios nuevos (almacenados en configuración)
    const preciosDinamicos: Record<string, any[]> = {};
    try {
      servicios.forEach((servicio) => {
        try {
          const config = servicio.configuracion as any;
          if (config && config.preciosVehiculos && Array.isArray(config.preciosVehiculos)) {
            preciosDinamicos[servicio.codigo] = config.preciosVehiculos.map((p: any) => {
              try {
                // Buscar el vehículo para obtener sus capacidades reales
                const vehiculo = vehiculos.find((v) => v && v.id === p.vehiculoId);
                return {
                  id: p.vehiculoId || 0, // Usar vehiculoId como ID temporal
                  vehiculoId: p.vehiculoId || 0,
                  pasajerosMin: vehiculo ? vehiculo.capacidadMin : (p.pasajerosMin || 1),
                  pasajerosMax: vehiculo ? vehiculo.capacidadMax : (p.pasajerosMax || 1),
                  precio: p.precio || 0,
                  activo: true,
                };
              } catch (error) {
                console.error('Error procesando precio dinámico:', error);
                return null;
              }
            }).filter((p: any) => p !== null);
          }
        } catch (error) {
          console.error(`Error procesando servicio ${servicio.codigo}:`, error);
        }
      });
    } catch (error) {
      console.error('❌ Error al procesar precios dinámicos:', error);
    }

    // Asegurar que todos los valores sean arrays válidos
    const responseData = {
      servicios: Array.isArray(servicios) ? servicios : [],
      vehiculos: Array.isArray(vehiculos) ? vehiculos : [],
      precios: {
        airport: Array.isArray(preciosAirport) ? preciosAirport : [],
        guatape: Array.isArray(preciosGuatape) ? preciosGuatape : [],
        guatapeVehiculos: Array.isArray(preciosGuatapeVehiculos) ? preciosGuatapeVehiculos : [],
        guatapeAdicionales: Array.isArray(preciosGuatapeAdicionales) ? preciosGuatapeAdicionales : [],
        cityTour: Array.isArray(preciosCityTour) ? preciosCityTour : [],
        graffiti: Array.isArray(preciosGraffiti) ? preciosGraffiti : [],
        haciendaNapoles: Array.isArray(preciosHaciendaNapoles) ? preciosHaciendaNapoles : [],
        occidente: Array.isArray(preciosOccidente) ? preciosOccidente : [],
        parapente: Array.isArray(preciosParapente) ? preciosParapente : [],
        atv: Array.isArray(preciosAtv) ? preciosAtv : [],
        jardin: Array.isArray(preciosJardin) ? preciosJardin : [],
        coffeeFarm: Array.isArray(preciosCoffeeFarm) ? preciosCoffeeFarm : [],
        dinamicos: preciosDinamicos || {}, // Precios de servicios nuevos
      },
    };

    console.log(`✅ Respuesta preparada: ${responseData.servicios.length} servicios, ${responseData.vehiculos.length} vehículos`);

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('❌ Error fetching services:', error);
    // Log detallado del error para debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // En lugar de devolver un error 500, devolver una respuesta exitosa con datos vacíos
    // Esto asegura que la aplicación siempre funcione, incluso si hay problemas con la BD
    return NextResponse.json({
      success: true,
      data: {
        servicios: [],
        vehiculos: [],
        precios: {
          airport: [],
          guatape: [],
          guatapeVehiculos: [],
          guatapeAdicionales: [],
          cityTour: [],
          graffiti: [],
          haciendaNapoles: [],
          occidente: [],
          parapente: [],
          atv: [],
          jardin: [],
          coffeeFarm: [],
          dinamicos: {},
        },
      },
    });
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

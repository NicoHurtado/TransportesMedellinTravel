import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET - Obtener todos los hoteles
export async function GET(request: NextRequest) {
  try {
    const hoteles = await prisma.hotel.findMany({
      where: {
        activo: true,
      },
      include: {
        _count: {
          select: {
            reservasAirport: true,
            reservasGuatape: true,
            reservasCityTour: true,
            reservasGraffitiTour: true,
            reservasHaciendaNapoles: true,
            reservasOccidente: true,
            reservasParapente: true,
            reservasAtv: true,
            reservasJardin: true,
            reservasCoffeeFarm: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Obtener todas las comisiones usando SQL directo
    const hotelIds = hoteles.map(h => h.id);
    const todasLasComisiones = hotelIds.length > 0 
      ? await prisma.$queryRaw<any[]>`
          SELECT 
            hc.id,
            hc."hotelId",
            hc."servicio",
            hc."vehiculoId",
            hc."comision",
            hc."createdAt",
            hc."updatedAt",
            v.id as "vehiculo_id",
            v.nombre as "vehiculo_nombre",
            v."capacidadMin" as "vehiculo_capacidadMin",
            v."capacidadMax" as "vehiculo_capacidadMax",
            v."imagenUrl" as "vehiculo_imagenUrl"
          FROM hotel_comisiones hc
          LEFT JOIN vehiculos v ON hc."vehiculoId" = v.id
          WHERE hc."hotelId" = ANY(${hotelIds}::int[])
        `
      : [];

    // Agrupar comisiones por hotel
    const comisionesPorHotel = new Map<number, any[]>();
    todasLasComisiones.forEach((c: any) => {
      const hotelId = Number(c.hotelId);
      if (!comisionesPorHotel.has(hotelId)) {
        comisionesPorHotel.set(hotelId, []);
      }
      comisionesPorHotel.get(hotelId)!.push({
        id: Number(c.id),
        servicio: c.servicio,
        vehiculoId: Number(c.vehiculoId),
        vehiculo: c.vehiculo_id ? {
          id: Number(c.vehiculo_id),
          nombre: c.vehiculo_nombre,
          capacidadMin: Number(c.vehiculo_capacidadMin),
          capacidadMax: Number(c.vehiculo_capacidadMax),
          imagenUrl: c.vehiculo_imagenUrl,
        } : null,
        comision: Number(c.comision),
      });
    });

    // Calcular estadísticas para cada hotel
    const hotelesConEstadisticas = hoteles.map((hotel) => {
      // Contar reservas del mes actual
      const mesActual = new Date();
      mesActual.setDate(1);
      mesActual.setHours(0, 0, 0, 0);

      const totalReservas = 
        hotel._count.reservasAirport +
        hotel._count.reservasGuatape +
        hotel._count.reservasCityTour +
        hotel._count.reservasGraffitiTour +
        hotel._count.reservasHaciendaNapoles +
        hotel._count.reservasOccidente +
        hotel._count.reservasParapente +
        hotel._count.reservasAtv +
        hotel._count.reservasJardin +
        hotel._count.reservasCoffeeFarm;

      return {
        id: hotel.id,
        codigo: hotel.codigo,
        nombre: hotel.nombre,
        comisionPorcentaje: Number(hotel.comisionPorcentaje),
        contactoNombre: hotel.contactoNombre,
        contactoEmail: hotel.contactoEmail,
        contactoTelefono: hotel.contactoTelefono,
        activo: hotel.activo,
        createdAt: hotel.createdAt,
        comisiones: comisionesPorHotel.get(hotel.id) || [],
        reservasEsteMes: totalReservas, // TODO: Filtrar por mes actual
        tasaCancelacion: 0, // TODO: Calcular tasa de cancelación
      };
    });

    return NextResponse.json({
      success: true,
      data: hotelesConEstadisticas,
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener los hoteles',
      },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo hotel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, comisiones, tarifaCancelacion } = body;

    if (!nombre) {
      return NextResponse.json(
        {
          success: false,
          error: 'El nombre del hotel es requerido',
        },
        { status: 400 }
      );
    }

    // Generar código automático basado en el nombre
    const generarCodigo = (nombre: string): string => {
      const palabras = nombre
        .toUpperCase()
        .split(' ')
        .filter((p) => p.length > 0);
      
      let codigo = '';
      if (palabras.length >= 2) {
        codigo = palabras[0].substring(0, 1) + palabras[1].substring(0, 2);
      } else {
        codigo = palabras[0].substring(0, 3);
      }
      
      // Agregar año
      const año = new Date().getFullYear();
      codigo += año;
      
      return codigo;
    };

    let codigo = generarCodigo(nombre);
    
    // Verificar si el código ya existe y generar uno único
    let codigoExiste = await prisma.hotel.findUnique({
      where: { codigo },
    });

    let contador = 1;
    while (codigoExiste) {
      codigo = generarCodigo(nombre) + contador;
      codigoExiste = await prisma.hotel.findUnique({
        where: { codigo },
      });
      contador++;
    }

    // Crear hotel primero
    const hotel = await prisma.hotel.create({
      data: {
        codigo,
        nombre,
        comisionPorcentaje: 10.00, // Default
        tarifaCancelacion: tarifaCancelacion ? new Prisma.Decimal(Number(tarifaCancelacion)) : null,
        activo: true,
      },
    });

    // Crear comisiones si hay
    if (comisiones && comisiones.length > 0) {
      // Acceder al modelo de forma dinámica para evitar problemas de caché
      const HotelComisionModel = (prisma as any).hotelComision;
      
      if (!HotelComisionModel) {
        // Si el modelo no está disponible, usar SQL directo como fallback
        console.warn('HotelComision model not found, using raw SQL');
        for (const c of comisiones) {
          try {
            await prisma.$executeRaw`
              INSERT INTO hotel_comisiones ("hotelId", "servicio", "vehiculoId", "comision", "createdAt", "updatedAt")
              VALUES (${hotel.id}, ${c.servicio}, ${Number(c.vehiculoId)}, ${Number(c.comision)}, NOW(), NOW())
              ON CONFLICT ("hotelId", "servicio", "vehiculoId") DO NOTHING
            `;
          } catch (error: any) {
            console.error('Error creating hotel commission with raw SQL:', error);
            // Continuar con las demás comisiones
          }
        }
      } else {
        // Crear comisiones una por una, manejando errores de duplicados
        for (const c of comisiones) {
          try {
            await HotelComisionModel.create({
              data: {
                hotelId: hotel.id,
                servicio: c.servicio,
                vehiculoId: Number(c.vehiculoId),
                comision: Number(c.comision),
              },
            });
          } catch (error: any) {
            // Si es un error de duplicado, ignorarlo
            if (error.code !== 'P2002') {
              console.error('Error creating hotel commission:', error);
              throw error;
            }
          }
        }
      }
    }

    // Obtener hotel
    const hotelConComisiones = await prisma.hotel.findUnique({
      where: { id: hotel.id },
    });

    // Obtener comisiones usando SQL directo ya que el cliente no reconoce la relación
    const comisionesData = await prisma.$queryRaw<any[]>`
      SELECT 
        hc.id,
        hc."hotelId",
        hc."servicio",
        hc."vehiculoId",
        hc."comision",
        hc."createdAt",
        hc."updatedAt",
        v.id as "vehiculo_id",
        v.nombre as "vehiculo_nombre",
        v."capacidadMin" as "vehiculo_capacidadMin",
        v."capacidadMax" as "vehiculo_capacidadMax",
        v."imagenUrl" as "vehiculo_imagenUrl"
      FROM hotel_comisiones hc
      LEFT JOIN vehiculos v ON hc."vehiculoId" = v.id
      WHERE hc."hotelId" = ${hotel.id}
    `;

    return NextResponse.json(
      {
        success: true,
        data: {
          id: hotelConComisiones!.id,
          codigo: hotelConComisiones!.codigo,
          nombre: hotelConComisiones!.nombre,
          comisionPorcentaje: Number(hotelConComisiones!.comisionPorcentaje),
          comisiones: comisionesData.map((c: any) => ({
            id: Number(c.id),
            servicio: c.servicio,
            vehiculoId: Number(c.vehiculoId),
            vehiculo: c.vehiculo_id ? {
              id: Number(c.vehiculo_id),
              nombre: c.vehiculo_nombre,
              capacidadMin: Number(c.vehiculo_capacidadMin),
              capacidadMax: Number(c.vehiculo_capacidadMax),
              imagenUrl: c.vehiculo_imagenUrl,
            } : null,
            comision: Number(c.comision),
          })),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating hotel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear el hotel',
      },
      { status: 500 }
    );
  }
}


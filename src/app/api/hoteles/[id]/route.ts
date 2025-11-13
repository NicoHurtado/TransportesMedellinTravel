import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// GET - Obtener un hotel específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de hotel inválido',
        },
        { status: 400 }
      );
    }

    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hotel no encontrado',
        },
        { status: 404 }
      );
    }

    // Obtener comisiones usando SQL directo
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
      WHERE hc."hotelId" = ${hotelId}
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: hotel.id,
        codigo: hotel.codigo,
        nombre: hotel.nombre,
        comisionPorcentaje: Number(hotel.comisionPorcentaje),
        tarifaCancelacion: hotel.tarifaCancelacion ? Number(hotel.tarifaCancelacion) : null,
        contactoNombre: hotel.contactoNombre,
        contactoEmail: hotel.contactoEmail,
        contactoTelefono: hotel.contactoTelefono,
        activo: hotel.activo,
        createdAt: hotel.createdAt,
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
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener el hotel',
      },
      { status: 500 }
    );
  }
}

// PUT - Actualizar un hotel
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de hotel inválido',
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { nombre, comisiones, activo, tarifaCancelacion } = body;
    
    console.log('📥 Recibiendo datos para actualizar hotel:', {
      nombre,
      tarifaCancelacion,
      tieneComisiones: !!comisiones,
      cantidadComisiones: comisiones?.length || 0,
      activo,
    });

    // Verificar que el hotel existe
    const hotelExistente = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotelExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hotel no encontrado',
        },
        { status: 404 }
      );
    }

    // Actualizar el hotel
    const updateData: any = {};
    if (nombre) updateData.nombre = nombre;
    if (activo !== undefined) updateData.activo = activo;
    
    // Manejar tarifaCancelacion: si es undefined, no actualizar; si es null o número, actualizar
    if (tarifaCancelacion !== undefined) {
      if (tarifaCancelacion === null || tarifaCancelacion === '') {
        updateData.tarifaCancelacion = null;
        console.log('💾 Estableciendo tarifaCancelacion a null');
      } else {
        const tarifaValue = Number(tarifaCancelacion);
        if (!isNaN(tarifaValue) && tarifaValue >= 0) {
          // Convertir a Decimal para Prisma
          // Decimal(10, 2) permite hasta 99,999,999.99
          // Usar string para evitar problemas de precisión con números grandes
          const tarifaString = tarifaValue.toString();
          updateData.tarifaCancelacion = new Prisma.Decimal(tarifaString);
          console.log(`💾 Estableciendo tarifaCancelacion a ${tarifaString} (Decimal)`);
          console.log(`💾 Valor Decimal creado:`, updateData.tarifaCancelacion.toString());
        } else {
          console.warn('⚠️ Valor inválido para tarifaCancelacion:', tarifaCancelacion);
        }
      }
    }
    
    console.log('💾 Datos a actualizar en hotel:', updateData);
    console.log('💾 Tipo de tarifaCancelacion:', updateData.tarifaCancelacion ? typeof updateData.tarifaCancelacion : 'null');
    
    let hotel;
    try {
      hotel = await prisma.hotel.update({
        where: { id: hotelId },
        data: updateData,
      });
      
      console.log('✅ Hotel actualizado:', {
        id: hotel.id,
        nombre: hotel.nombre,
        tarifaCancelacion: hotel.tarifaCancelacion,
      });
    } catch (updateError: any) {
      console.error('❌ Error al actualizar hotel en Prisma:', updateError);
      console.error('❌ Mensaje de error:', updateError.message);
      console.error('❌ Stack:', updateError.stack);
      throw updateError;
    }

    // Si se proporcionan comisiones, actualizarlas
    if (comisiones && Array.isArray(comisiones)) {
      console.log('📥 Recibiendo comisiones para actualizar:', comisiones);
      
      // Eliminar todas las comisiones existentes
      await prisma.$executeRaw`
        DELETE FROM hotel_comisiones WHERE "hotelId" = ${hotelId}
      `;

      // Crear las nuevas comisiones
      if (comisiones.length > 0) {
        for (const c of comisiones) {
          try {
            const servicio = c.servicio;
            const vehiculoId = Number(c.vehiculoId);
            const comisionValue = Number(c.comision);
            
            console.log(`💾 Guardando comisión: servicio=${servicio}, vehiculoId=${vehiculoId}, comision=${comisionValue}`);
            
            await prisma.$executeRaw`
              INSERT INTO hotel_comisiones ("hotelId", "servicio", "vehiculoId", "comision", "createdAt", "updatedAt")
              VALUES (${hotelId}, ${servicio}, ${vehiculoId}, ${comisionValue}, NOW(), NOW())
            `;
          } catch (error: any) {
            console.error('❌ Error creating hotel commission:', error);
            console.error('❌ Datos de la comisión:', c);
            // Continuar con las demás comisiones
          }
        }
        console.log(`✅ Se guardaron ${comisiones.length} comisiones para el hotel ${hotelId}`);
      } else {
        console.log('ℹ️ No hay comisiones para guardar (array vacío)');
      }
    } else {
      console.log('ℹ️ No se proporcionaron comisiones o no es un array válido');
    }

    // Obtener el hotel actualizado con comisiones
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
      WHERE hc."hotelId" = ${hotelId}
    `;

    return NextResponse.json({
      success: true,
      data: {
        id: hotel.id,
        codigo: hotel.codigo,
        nombre: hotel.nombre,
        comisionPorcentaje: Number(hotel.comisionPorcentaje),
        tarifaCancelacion: hotel.tarifaCancelacion ? Number(hotel.tarifaCancelacion) : null,
        contactoNombre: hotel.contactoNombre,
        contactoEmail: hotel.contactoEmail,
        contactoTelefono: hotel.contactoTelefono,
        activo: hotel.activo,
        createdAt: hotel.createdAt,
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
    });
  } catch (error: any) {
    console.error('❌ Error updating hotel:', error);
    console.error('❌ Error message:', error?.message);
    console.error('❌ Error stack:', error?.stack);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar el hotel',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar (desactivar) un hotel
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID de hotel inválido',
        },
        { status: 400 }
      );
    }

    // Verificar que el hotel existe
    const hotelExistente = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotelExistente) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hotel no encontrado',
        },
        { status: 404 }
      );
    }

    // Desactivar el hotel (soft delete)
    const hotel = await prisma.hotel.update({
      where: { id: hotelId },
      data: {
        activo: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: hotel.id,
        codigo: hotel.codigo,
        nombre: hotel.nombre,
        activo: hotel.activo,
      },
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar el hotel',
      },
      { status: 500 }
    );
  }
}


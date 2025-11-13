import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n');

  // 1. Crear vehículos
  console.log('📦 Creando vehículos...');
  const vehiculos = await Promise.all([
    prisma.vehiculo.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: 'Automóvil 1-3 personas',
        capacidadMin: 1,
        capacidadMax: 3,
        imagenUrl: '/1-3.png',
        tipo: 'sedan',
      },
    }),
    prisma.vehiculo.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nombre: 'Camioneta SUV 4 personas',
        capacidadMin: 4,
        capacidadMax: 4,
        imagenUrl: '/4-4.png',
        tipo: 'suv',
      },
    }),
    prisma.vehiculo.upsert({
      where: { id: 3 },
      update: {},
      create: {
        nombre: 'Van 5-8 personas',
        capacidadMin: 5,
        capacidadMax: 8,
        imagenUrl: '/5-8.png',
        tipo: 'van',
      },
    }),
    prisma.vehiculo.upsert({
      where: { id: 4 },
      update: {},
      create: {
        nombre: 'Van 9-15 personas',
        capacidadMin: 9,
        capacidadMax: 15,
        imagenUrl: '/9-15.png',
        tipo: 'van',
      },
    }),
    prisma.vehiculo.upsert({
      where: { id: 5 },
      update: {},
      create: {
        nombre: 'Van 16-18 personas',
        capacidadMin: 16,
        capacidadMax: 18,
        imagenUrl: '/16-18.png',
        tipo: 'van',
      },
    }),
    prisma.vehiculo.upsert({
      where: { id: 6 },
      update: {},
      create: {
        nombre: 'Bus 19-25 personas',
        capacidadMin: 19,
        capacidadMax: 25,
        imagenUrl: '/19-25.png',
        tipo: 'bus',
      },
    }),
  ]);

  console.log(`✅ ${vehiculos.length} vehículos creados\n`);

  // 2. Crear hotel de prueba
  console.log('🏨 Creando hotel de prueba...');
  const hotel = await prisma.hotel.upsert({
    where: { codigo: 'DEMO2024' },
    update: {},
    create: {
      codigo: 'DEMO2024',
      nombre: 'Hotel Demo Plaza',
      comisionPorcentaje: 10,
      contactoNombre: 'Admin Hotel',
      contactoEmail: 'admin@hoteldemo.com',
      contactoTelefono: '+57 300 123 4567',
      activo: true,
    },
  });

  console.log(`✅ Hotel creado: ${hotel.nombre} (Código: ${hotel.codigo})\n`);

  // 2.3. Crear conductores
  console.log('👥 Creando conductores...');
  const conductores = await Promise.all([
    prisma.conductor.upsert({
      where: { id: 1 },
      update: {},
      create: {
        nombre: 'Pedro Gómez',
        whatsapp: '+57 300 111 2222',
        notasAdicionales: 'Conductor experimentado con más de 10 años en el sector. Especializado en rutas de aeropuerto.',
        activo: true,
      },
    }),
    prisma.conductor.upsert({
      where: { id: 2 },
      update: {},
      create: {
        nombre: 'Luis Fernández',
        whatsapp: '+57 310 222 3333',
        notasAdicionales: 'Experto en tours. Habla inglés básico. Muy amable con los turistas.',
        activo: true,
      },
    }),
    prisma.conductor.upsert({
      where: { id: 3 },
      update: {},
      create: {
        nombre: 'Carlos Ríos',
        whatsapp: '+57 320 333 4444',
        notasAdicionales: 'Conductor de confianza. Disponible para servicios largos y tours completos.',
        activo: true,
      },
    }),
  ]);

  console.log(`✅ ${conductores.length} conductores creados\n`);

  // 2.5. Crear servicios
  console.log('🎯 Creando servicios...');
  const servicios = await Promise.all([
    prisma.servicio.upsert({
      where: { codigo: 'airport-transfer' },
      update: {},
      create: {
        codigo: 'airport-transfer',
        nombreEs: 'Transporte Aeropuerto',
        nombreEn: 'Airport Transfer',
        descripcionCortaEs: 'Traslado seguro y cómodo desde/hacia el aeropuerto',
        descripcionCortaEn: 'Safe and comfortable transfer from/to the airport',
        descripcionCompletaEs: 'Servicio de transporte privado desde o hacia el Aeropuerto José María Córdova. Incluye conductor profesional, vehículo climatizado y seguimiento de vuelo.',
        descripcionCompletaEn: 'Private transportation service from or to José María Córdova Airport. Includes professional driver, air-conditioned vehicle and flight tracking.',
        imagenUrl: '/aeropuerto.avif',
        tipo: 'transfer',
        tablaReservas: 'reservas_airport_transfer',
        activo: true,
        ordenDisplay: 1,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'guatape-tour' },
      update: {},
      create: {
        codigo: 'guatape-tour',
        nombreEs: 'Tour Guatapé',
        nombreEn: 'Guatapé Tour',
        descripcionCortaEs: 'Conoce el pueblo más colorido de Colombia y la Piedra del Peñol',
        descripcionCortaEn: 'Discover the most colorful town in Colombia and the Peñol Rock',
        descripcionCompletaEs: 'Tour de día completo a Guatapé. Incluye visita al pueblo colonial, paseo en bote (opcional), almuerzo (opcional) y tiempo libre para subir a la Piedra del Peñol.',
        descripcionCompletaEn: 'Full-day tour to Guatapé. Includes visit to the colonial town, boat ride (optional), lunch (optional) and free time to climb the Peñol Rock.',
        imagenUrl: '/guatape.jpg',
        tipo: 'tour',
        tablaReservas: 'reservas_guatape_tour',
        activo: true,
        ordenDisplay: 2,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'city-tour' },
      update: {},
      create: {
        codigo: 'city-tour',
        nombreEs: 'City Tour Medellín',
        nombreEn: 'Medellín City Tour',
        descripcionCortaEs: 'Recorre los lugares más emblemáticos de la ciudad',
        descripcionCortaEn: 'Explore the most iconic places of the city',
        descripcionCompletaEs: 'Tour por los principales atractivos de Medellín: Parque Botero, Plaza Botero, Museo de Antioquia, Pueblito Paisa y Parque de las Luces.',
        descripcionCompletaEn: 'Tour through the main attractions of Medellín: Botero Park, Botero Square, Antioquia Museum, Pueblito Paisa and Lights Park.',
        imagenUrl: '/medellin.jpg',
        tipo: 'tour',
        tablaReservas: 'reservas_city_tour',
        activo: true,
        ordenDisplay: 3,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'graffiti-tour' },
      update: {},
      create: {
        codigo: 'graffiti-tour',
        nombreEs: 'Comuna 13 - Graffiti Tour',
        nombreEn: 'Comuna 13 - Graffiti Tour',
        descripcionCortaEs: 'Descubre la transformación de la Comuna 13 a través del arte urbano',
        descripcionCortaEn: 'Discover the transformation of Comuna 13 through urban art',
        descripcionCompletaEs: 'Tour guiado por la Comuna 13, conoce su historia de transformación, disfruta de los coloridos murales y las escaleras eléctricas.',
        descripcionCompletaEn: 'Guided tour through Comuna 13, learn about its transformation story, enjoy the colorful murals and electric stairs.',
        imagenUrl: '/grafiti.avif',
        tipo: 'tour',
        tablaReservas: 'reservas_graffiti_tour',
        activo: true,
        ordenDisplay: 4,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'hacienda-napoles-tour' },
      update: {},
      create: {
        codigo: 'hacienda-napoles-tour',
        nombreEs: 'Tour Hacienda Nápoles',
        nombreEn: 'Hacienda Nápoles Tour',
        descripcionCortaEs: 'Visita el parque temático de la antigua hacienda de Pablo Escobar',
        descripcionCortaEn: 'Visit the theme park of Pablo Escobar\'s former estate',
        descripcionCompletaEs: 'Tour de día completo a la Hacienda Nápoles. Incluye transporte, entrada al parque con safari africano, museo y parque acuático.',
        descripcionCompletaEn: 'Full-day tour to Hacienda Nápoles. Includes transportation, park entrance with African safari, museum and water park.',
        imagenUrl: '/haciendanapoles.jpg',
        tipo: 'tour',
        tablaReservas: 'reservas_hacienda_napoles_tour',
        activo: true,
        ordenDisplay: 5,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'occidente-tour' },
      update: {},
      create: {
        codigo: 'occidente-tour',
        nombreEs: 'Tour Occidente',
        nombreEn: 'West Tour',
        descripcionCortaEs: 'Recorre los pueblos del occidente antioqueño',
        descripcionCortaEn: 'Explore the towns of western Antioquia',
        descripcionCompletaEs: 'Tour por Santa Fe de Antioquia, pueblo colonial con puente colgante y clima cálido. Incluye visita al pueblo y tiempo libre.',
        descripcionCompletaEn: 'Tour through Santa Fe de Antioquia, colonial town with suspension bridge and warm weather. Includes town visit and free time.',
        imagenUrl: '/occidente.jpg',
        tipo: 'tour',
        tablaReservas: 'reservas_occidente_tour',
        activo: true,
        ordenDisplay: 6,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'parapente-tour' },
      update: {},
      create: {
        codigo: 'parapente-tour',
        nombreEs: 'Tour Parapente',
        nombreEn: 'Paragliding Tour',
        descripcionCortaEs: 'Vuela en parapente sobre el Valle de Aburrá',
        descripcionCortaEn: 'Fly paragliding over the Aburrá Valley',
        descripcionCompletaEs: 'Experiencia de parapente en San Félix con instructores certificados. Incluye transporte, equipo completo y video del vuelo.',
        descripcionCompletaEn: 'Paragliding experience in San Félix with certified instructors. Includes transportation, complete equipment and flight video.',
        imagenUrl: '/parapente.jpg',
        tipo: 'tour',
        tablaReservas: 'reservas_parapente_tour',
        activo: true,
        ordenDisplay: 7,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'atv-tour' },
      update: {},
      create: {
        codigo: 'atv-tour',
        nombreEs: 'Tour ATV',
        nombreEn: 'ATV Tour',
        descripcionCortaEs: 'Aventura en cuatrimotor por caminos rurales',
        descripcionCortaEn: 'ATV adventure through rural roads',
        descripcionCompletaEs: 'Tour en cuatrimotor por las montañas cercanas a Medellín. Incluye equipo de seguridad, instrucción y guía.',
        descripcionCompletaEn: 'ATV tour through the mountains near Medellín. Includes safety equipment, instruction and guide.',
        imagenUrl: '/auto-removebg-preview.png',
        tipo: 'tour',
        tablaReservas: 'reservas_atv_tour',
        activo: true,
        ordenDisplay: 8,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'jardin-tour' },
      update: {},
      create: {
        codigo: 'jardin-tour',
        nombreEs: 'Tour Jardín',
        nombreEn: 'Jardín Tour',
        descripcionCortaEs: 'Visita uno de los pueblos más bellos de Colombia',
        descripcionCortaEn: 'Visit one of the most beautiful towns in Colombia',
        descripcionCompletaEs: 'Tour de día completo al pueblo de Jardín. Incluye visita al pueblo, teleférico y tiempo libre para conocer el lugar.',
        descripcionCompletaEn: 'Full-day tour to the town of Jardín. Includes town visit, cable car and free time to explore the place.',
        imagenUrl: '/medellin.jpg',
        tipo: 'tour',
        tablaReservas: 'reservas_jardin_tour',
        activo: true,
        ordenDisplay: 9,
      },
    }),
    prisma.servicio.upsert({
      where: { codigo: 'coffee-farm-tour' },
      update: {},
      create: {
        codigo: 'coffee-farm-tour',
        nombreEs: 'Tour Finca Cafetera',
        nombreEn: 'Coffee Farm Tour',
        descripcionCortaEs: 'Conoce el proceso del café desde la semilla hasta la taza',
        descripcionCortaEn: 'Learn about the coffee process from seed to cup',
        descripcionCompletaEs: 'Tour a una finca cafetera tradicional. Incluye recorrido por los cultivos, proceso de producción y degustación de café.',
        descripcionCompletaEn: 'Tour to a traditional coffee farm. Includes tour through the crops, production process and coffee tasting.',
        imagenUrl: '/medellin.jpg',
        tipo: 'tour',
        tablaReservas: 'reservas_coffee_farm_tour',
        activo: true,
        ordenDisplay: 10,
      },
    }),
  ]);

  console.log(`✅ ${servicios.length} servicios creados\n`);

  // 3. Crear precios para Airport Transfer
  console.log('✈️ Creando precios para Airport Transfer...');
  const preciosAirport = [
    { vehiculoId: 1, pasajerosMin: 1, pasajerosMax: 3, precio: 150000 },
    { vehiculoId: 2, pasajerosMin: 4, pasajerosMax: 4, precio: 180000 },
    { vehiculoId: 3, pasajerosMin: 5, pasajerosMax: 8, precio: 260000 },
    { vehiculoId: 4, pasajerosMin: 9, pasajerosMax: 10, precio: 300000 },
    { vehiculoId: 4, pasajerosMin: 11, pasajerosMax: 15, precio: 350000 },
    { vehiculoId: 5, pasajerosMin: 16, pasajerosMax: 18, precio: 400000 },
    { vehiculoId: 6, pasajerosMin: 19, pasajerosMax: 25, precio: 650000 },
  ];

  for (const precio of preciosAirport) {
    await prisma.precioAirportTransfer.upsert({
      where: {
        vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
          vehiculoId: precio.vehiculoId,
          pasajerosMin: precio.pasajerosMin,
          pasajerosMax: precio.pasajerosMax,
          vigenteDesde: new Date(),
        },
      },
      update: {},
      create: precio,
    });
  }

  console.log(`✅ ${preciosAirport.length} precios Airport Transfer creados\n`);

  // 4. Crear precios base para Guatapé
  console.log('🏔️ Creando precios para Guatapé Tour...');
  await prisma.precioGuatapeTour.upsert({
    where: { id: 1 },
    update: {},
    create: {
      precioBasePorPersona: 650000,
      activo: true,
    },
  });

  const preciosGuatape = [
    { vehiculoId: 2, pasajerosMin: 1, pasajerosMax: 4, precio: 650000 },
    { vehiculoId: 3, pasajerosMin: 5, pasajerosMax: 7, precio: 800000 },
    { vehiculoId: 4, pasajerosMin: 8, pasajerosMax: 14, precio: 850000 },
    { vehiculoId: 5, pasajerosMin: 15, pasajerosMax: 18, precio: 1050000 },
  ];

  for (const precio of preciosGuatape) {
    await prisma.precioVehiculoGuatape.upsert({
      where: {
        vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
          vehiculoId: precio.vehiculoId,
          pasajerosMin: precio.pasajerosMin,
          pasajerosMax: precio.pasajerosMax,
          vigenteDesde: new Date(),
        },
      },
      update: {},
      create: precio,
    });
  }

  const adicionalesGuatape = [
    { tipo: 'bote', rango: '1-6', precio: 230000 },
    { tipo: 'bote', rango: '1-15', precio: 250000 },
    { tipo: 'bote', rango: '1-22', precio: 300000 },
    { tipo: 'bote', rango: '1-30', precio: 400000 },
    { tipo: 'almuerzo', rango: null, precio: 37000 },
    { tipo: 'guia_espanol', rango: null, precio: 280000 },
    { tipo: 'guia_ingles', rango: null, precio: 350000 },
  ];

  for (const adicional of adicionalesGuatape) {
    await prisma.precioAdicionalGuatape.upsert({
      where: { id: adicionalesGuatape.indexOf(adicional) + 1 },
      update: {},
      create: adicional,
    });
  }

  console.log(`✅ Precios Guatapé creados (vehículos y adicionales)\n`);

  // 5. Crear precios para City Tour
  console.log('🏙️ Creando precios para City Tour...');
  const preciosCityTour = [
    { vehiculoId: 1, pasajerosMin: 1, pasajerosMax: 3, precio: 65000 },
    { vehiculoId: 2, pasajerosMin: 4, pasajerosMax: 4, precio: 75000 },
    { vehiculoId: 3, pasajerosMin: 5, pasajerosMax: 8, precio: 85000 },
    { vehiculoId: 4, pasajerosMin: 9, pasajerosMax: 10, precio: 95000 },
    { vehiculoId: 4, pasajerosMin: 11, pasajerosMax: 15, precio: 105000 },
    { vehiculoId: 5, pasajerosMin: 16, pasajerosMax: 18, precio: 120000 },
  ];

  for (const precio of preciosCityTour) {
    await prisma.precioVehiculoCityTour.upsert({
      where: {
        vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
          vehiculoId: precio.vehiculoId,
          pasajerosMin: precio.pasajerosMin,
          pasajerosMax: precio.pasajerosMax,
          vigenteDesde: new Date(),
        },
      },
      update: {},
      create: precio,
    });
  }

  console.log(`✅ ${preciosCityTour.length} precios City Tour creados\n`);

  // 6. Crear precios para Comuna 13 (Graffiti Tour)
  console.log('🎨 Creando precios para Comuna 13...');
  const preciosGraffiti = [
    { vehiculoId: 1, pasajerosMin: 1, pasajerosMax: 3, precio: 111111 },
    { vehiculoId: 2, pasajerosMin: 4, pasajerosMax: 4, precio: 111111 },
    { vehiculoId: 3, pasajerosMin: 5, pasajerosMax: 8, precio: 111111 },
    { vehiculoId: 4, pasajerosMin: 9, pasajerosMax: 10, precio: 111111 },
    { vehiculoId: 4, pasajerosMin: 11, pasajerosMax: 15, precio: 111111 },
    { vehiculoId: 5, pasajerosMin: 16, pasajerosMax: 18, precio: 111111 },
  ];

  for (const precio of preciosGraffiti) {
    await prisma.precioVehiculoGraffitiTour.upsert({
      where: {
        vehiculoId_pasajerosMin_pasajerosMax_vigenteDesde: {
          vehiculoId: precio.vehiculoId,
          pasajerosMin: precio.pasajerosMin,
          pasajerosMax: precio.pasajerosMax,
          vigenteDesde: new Date(),
        },
      },
      update: {},
      create: precio,
    });
  }

  console.log(`✅ ${preciosGraffiti.length} precios Comuna 13 creados\n`);

  // 7. Crear reservas de ejemplo
  console.log('📝 Creando reservas de ejemplo...');
  
  // Función helper para generar código de reserva
  const generateReservaCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Fecha de hoy y mañana
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  const pasadoManana = new Date(hoy);
  pasadoManana.setDate(pasadoManana.getDate() + 2);

  // Hora de ejemplo
  const hora = new Date();
  hora.setHours(8, 0, 0, 0);

  // Reserva Airport Transfer - Pendiente
  await prisma.reservaAirportTransfer.create({
    data: {
      codigoReserva: generateReservaCode(),
      servicioId: 1,
      hotelId: hotel.id,
      direccion: 'from',
      aeropuerto: 'MDE',
      numeroVuelo: 'AV8234',
      origen: 'Aeropuerto José María Córdova',
      destino: 'Hotel Demo Plaza',
      fecha: manana,
      hora: hora,
      numeroPasajeros: 2,
      vehiculoId: 1,
      precioVehiculo: 150000,
      precioTotal: 150000,
      comisionHotel: 15000,
      precioFinal: 165000,
      nombreContacto: 'Juan Pérez',
      telefonoContacto: '+57 300 123 4567',
      emailContacto: 'juan.perez@email.com',
      personasAsistentes: [
        { nombre: 'Juan Pérez', edad: 35 },
        { nombre: 'María García', edad: 32 }
      ],
      notasCliente: 'Llegada terminal nacional',
      estado: 'pendiente_por_cotizacion',
    },
  });

  // Reserva Guatapé Tour - Confirmada
  await prisma.reservaGuatapeTour.create({
    data: {
      codigoReserva: generateReservaCode(),
      servicioId: 2,
      hotelId: hotel.id,
      lugarRecogida: 'Hotel Demo Plaza',
      fecha: pasadoManana,
      hora: hora,
      numeroPasajeros: 4,
      idiomaTour: 'Español',
      quiereGuia: true,
      precioGuia: 280000,
      paseoBote: '1-6',
      precioBote: 230000,
      cantidadAlmuerzos: 4,
      precioAlmuerzos: 148000,
      vehiculoId: 2,
      precioBase: 650000,
      precioVehiculo: 650000,
      precioServiciosAdicionales: 378000,
      precioTotal: 1028000,
      comisionHotel: 102800,
      precioFinal: 1130800,
      nombreContacto: 'Ana Martínez',
      telefonoContacto: '+57 310 987 6543',
      emailContacto: 'ana.martinez@email.com',
      personasAsistentes: [
        { nombre: 'Ana Martínez', edad: 28 },
        { nombre: 'Carlos López', edad: 30 },
        { nombre: 'Laura Gómez', edad: 26 },
        { nombre: 'Diego Torres', edad: 29 }
      ],
      peticionesEspeciales: 'Preferimos almuerzo vegetariano',
      estado: 'agendada_con_cotizacion',
    },
  });

  // Reserva City Tour - Asignada
  await prisma.reservaCityTour.create({
    data: {
      codigoReserva: generateReservaCode(),
      servicioId: 3,
      hotelId: hotel.id,
      lugarRecogida: 'Hotel Demo Plaza',
      fecha: hoy,
      hora: hora,
      numeroPasajeros: 3,
      idiomaTour: 'Inglés',
      quiereGuia: true,
      precioGuia: 350000,
      vehiculoId: 1,
      precioBase: 65000,
      precioVehiculo: 65000,
      precioTotal: 415000,
      comisionHotel: 41500,
      precioFinal: 456500,
      nombreContacto: 'Michael Johnson',
      telefonoContacto: '+1 555 123 4567',
      emailContacto: 'michael.j@email.com',
      personasAsistentes: [
        { nombre: 'Michael Johnson', edad: 45 },
        { nombre: 'Sarah Johnson', edad: 42 },
        { nombre: 'Emma Johnson', edad: 16 }
      ],
      estado: 'asignada',
      conductorAsignado: 'Pedro Rodríguez',
      vehiculoAsignado: 'Automóvil Mazda 3 - ABC123',
    },
  });

  // Reserva Comuna 13 - Completada
  await prisma.reservaGraffitiTour.create({
    data: {
      codigoReserva: generateReservaCode(),
      servicioId: 4,
      hotelId: hotel.id,
      lugarRecogida: 'Hotel Demo Plaza',
      fecha: new Date(hoy.getTime() - 24 * 60 * 60 * 1000), // Ayer
      hora: hora,
      numeroPasajeros: 5,
      idiomaTour: 'Español',
      quiereGuia: false,
      vehiculoId: 3,
      precioBase: 111111,
      precioVehiculo: 111111,
      precioTotal: 111111,
      comisionHotel: 11111,
      precioFinal: 122222,
      nombreContacto: 'Sofía Ramírez',
      telefonoContacto: '+57 315 555 7890',
      emailContacto: 'sofia.r@email.com',
      personasAsistentes: [
        { nombre: 'Sofía Ramírez', edad: 24 },
        { nombre: 'Luis Castro', edad: 25 },
        { nombre: 'Camila Ortiz', edad: 23 },
        { nombre: 'Andrés Villa', edad: 26 },
        { nombre: 'Paula Muñoz', edad: 24 }
      ],
      estado: 'completada',
      conductorAsignado: 'José Hernández',
      vehiculoAsignado: 'Van Hyundai H1 - XYZ789',
    },
  });

  // Reserva Airport Transfer - Cancelada
  await prisma.reservaAirportTransfer.create({
    data: {
      codigoReserva: generateReservaCode(),
      servicioId: 1,
      hotelId: hotel.id,
      direccion: 'to',
      aeropuerto: 'MDE',
      numeroVuelo: 'LA4523',
      origen: 'Hotel Demo Plaza',
      destino: 'Aeropuerto José María Córdova',
      fecha: manana,
      hora: hora,
      numeroPasajeros: 1,
      vehiculoId: 1,
      precioVehiculo: 150000,
      precioTotal: 150000,
      comisionHotel: 15000,
      precioFinal: 165000,
      nombreContacto: 'Roberto Sánchez',
      telefonoContacto: '+57 320 444 8888',
      emailContacto: 'roberto.s@email.com',
      personasAsistentes: [
        { nombre: 'Roberto Sánchez', edad: 52 }
      ],
      notasCliente: 'Vuelo cancelado por la aerolínea',
      notasAdmin: 'Cliente solicitó cancelación sin costo',
      estado: 'cancelada',
    },
  });

  console.log('✅ 5 reservas de ejemplo creadas\n');

  console.log('🎉 ¡Seed completado exitosamente!\n');
  console.log('📋 Resumen:');
  console.log(`   ✅ ${vehiculos.length} vehículos`);
  console.log(`   ✅ 1 hotel demo (código: ${hotel.codigo})`);
  console.log(`   ✅ ${servicios.length} servicios`);
  console.log(`   ✅ Precios para Airport Transfer`);
  console.log(`   ✅ Precios para Guatapé Tour`);
  console.log(`   ✅ Precios para City Tour`);
  console.log(`   ✅ Precios para Comuna 13`);
  console.log(`   ✅ 5 reservas de ejemplo (todos los estados)`);
  console.log('\n💡 Tips:');
  console.log('   - Usa Prisma Studio para ver los datos: npx prisma studio');
  console.log('   - Código hotel demo: DEMO2024 (comisión 10%)');
  console.log('   - Inicia la app: npm run dev\n');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



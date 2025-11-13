import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuración de Prisma Client con manejo robusto de errores
const createPrismaClient = () => {
  // Verificar que DATABASE_URL esté configurada
  if (!process.env.DATABASE_URL) {
    const errorMsg = '❌ DATABASE_URL no está configurada en las variables de entorno';
    console.error(errorMsg);
    console.error('⚠️ IMPORTANTE: Ve a Vercel Dashboard → Settings → Environment Variables');
    console.error('   Agrega la variable DATABASE_URL con tu string de conexión PostgreSQL');
    
    // En producción, lanzar error pero con mensaje claro
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL no está configurada. Configúrala en Vercel: Settings → Environment Variables');
    }
    
    throw new Error('DATABASE_URL no está configurada. Por favor, configura esta variable de entorno.');
  }
  
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
    
    // En producción, conectar inmediatamente para verificar que funciona
    if (process.env.NODE_ENV === 'production') {
      client.$connect().catch((error) => {
        console.error('❌ Error al conectar Prisma Client en producción:', error);
        if (error.message?.includes('DATABASE_URL') || error.code === 'P1012') {
          console.error('⚠️ IMPORTANTE: DATABASE_URL no está configurada correctamente en Vercel');
          console.error('   Ve a: Vercel Dashboard → Tu Proyecto → Settings → Environment Variables');
          console.error('   Agrega: DATABASE_URL = tu_string_de_conexion_postgresql');
        }
      });
    }
    
    return client;
  } catch (error) {
    console.error('❌ Error al crear Prisma Client:', error);
    throw error;
  }
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Siempre reutilizar la instancia para evitar múltiples conexiones
globalForPrisma.prisma = prisma;

// Manejar desconexión graceful
process.on('beforeExit', async () => {
  await prisma.$disconnect().catch(() => {
    // Ignorar errores al desconectar
  });
});

export default prisma;



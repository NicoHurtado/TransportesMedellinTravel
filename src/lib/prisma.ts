import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configuración de Prisma Client con manejo robusto de errores
const createPrismaClient = () => {
  try {
    const client = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      errorFormat: 'pretty',
    });
    
    // En producción, conectar inmediatamente para verificar que funciona
    if (process.env.NODE_ENV === 'production') {
      client.$connect().catch((error) => {
        console.error('❌ Error al conectar Prisma Client en producción:', error);
      });
    }
    
    return client;
  } catch (error) {
    console.error('❌ Error al crear Prisma Client:', error);
    // En producción, no lanzar error, devolver un cliente que manejará errores
    if (process.env.NODE_ENV === 'production') {
      return new PrismaClient({
        log: ['error'],
        errorFormat: 'minimal',
      });
    }
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



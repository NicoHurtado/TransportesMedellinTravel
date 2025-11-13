/**
 * Helper para obtener la URL base de la aplicación
 * Funciona tanto en servidor como en cliente
 * 
 * En desarrollo local: usa localhost (detecta automáticamente el puerto)
 * En producción: usa NEXT_PUBLIC_APP_URL si está configurada, sino detecta automáticamente
 */
export function getBaseUrl(): string {
  // En el servidor (SSR/API routes)
  if (typeof window === 'undefined') {
    // Prioridad 1: Variable de entorno (configurada en producción)
    if (process.env.NEXT_PUBLIC_APP_URL) {
      return process.env.NEXT_PUBLIC_APP_URL;
    }
    
    // Prioridad 2: En producción sin variable, usar un dominio por defecto
    // (esto debería cambiarse por el dominio real antes de desplegar)
    if (process.env.NODE_ENV === 'production') {
      // Si no hay variable de entorno en producción, usar un fallback
      // IMPORTANTE: Cambiar esto por tu dominio real antes de desplegar
      return 'https://tudominio.com'; // ⚠️ CAMBIAR POR TU DOMINIO REAL
    }
    
    // Desarrollo local en servidor
    const port = process.env.PORT || '3000';
    return `http://localhost:${port}`;
  }
  
  // En el cliente (browser)
  const origin = window.location.origin;
  
  // Si estamos en localhost, mantenerlo para desarrollo (detecta puerto automáticamente)
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin;
  }
  
  // En producción desde el cliente, usar variable de entorno si está disponible
  // Si no, usar el origin actual (que debería ser el dominio correcto)
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }
  
  // Fallback: usar el origin actual del navegador
  return origin;
}

/**
 * Construye una URL completa para una ruta específica
 */
export function buildUrl(path: string): string {
  const baseUrl = getBaseUrl();
  // Asegurar que path empiece con /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Construye la URL de tracking para una reserva
 */
export function getTrackingUrl(codigoReserva: string): string {
  return buildUrl(`/tracking/${codigoReserva}`);
}

/**
 * Construye la URL de resultado de pago
 */
export function getPaymentResultUrl(): string {
  return buildUrl('/pagos/resultado');
}


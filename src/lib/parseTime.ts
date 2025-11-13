/**
 * Parsear hora de string a Date object
 * Maneja diferentes formatos: "HH:mm", "HH:mm:ss", etc.
 */
export function parseTimeToDate(hora: string | Date): Date {
  try {
    // Si ya es un Date, retornarlo
    if (hora instanceof Date) {
      return hora;
    }

    // Si es string y contiene ":"
    if (typeof hora === 'string' && hora.includes(':')) {
      const [hours, minutes, seconds] = hora.split(':');
      const date = new Date('1970-01-01T00:00:00Z');
      date.setUTCHours(
        parseInt(hours) || 0,
        parseInt(minutes) || 0,
        parseInt(seconds) || 0,
        0
      );
      return date;
    }

    // Intentar parsearlo como timestamp o string de fecha
    const parsed = new Date(hora);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Si todo falla, retornar medianoche
    return new Date('1970-01-01T00:00:00Z');
  } catch (e) {
    // Fallback a medianoche
    return new Date('1970-01-01T00:00:00Z');
  }
}


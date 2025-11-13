// Genera códigos únicos de reserva
export function generateReservationCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MT-${timestamp}-${random}`;
}

// Ejemplo: MT-L8P5QX9-A2D



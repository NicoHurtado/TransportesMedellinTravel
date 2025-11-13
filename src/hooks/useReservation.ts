import { useState } from 'react';

interface ReservationData {
  [key: string]: any;
}

interface ReservationResponse {
  success: boolean;
  data?: any;
  trackingUrl?: string;
  error?: string;
}

export function useReservation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReservation = async (
    serviceId: string,
    data: ReservationData
  ): Promise<ReservationResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/reservations/${serviceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error al crear la reserva');
      }

      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al procesar la reserva';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { createReservation, loading, error };
}



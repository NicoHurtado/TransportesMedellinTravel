'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HotelComision {
  id: number;
  servicio: string;
  vehiculoId: number;
  comision: number;
}

interface HotelContextType {
  isHotel: boolean;
  hotelName: string | null;
  hotelId: number | null;
  hotelCode: string | null;
  hotelCommission: number; // Percentage (e.g., 10 for 10%) - fallback
  hotelComisiones: HotelComision[]; // Comisiones específicas por servicio y vehículo
  setHotel: (code: string, name: string, id: number, comisiones: HotelComision[], commission?: number) => void;
  clearHotel: () => void;
  getComisionEspecifica: (servicio: string, vehiculoId: number) => number;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export function HotelProvider({ children }: { children: ReactNode }) {
  const [isHotel, setIsHotel] = useState(false);
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [hotelId, setHotelId] = useState<number | null>(null);
  const [hotelCode, setHotelCode] = useState<string | null>(null);
  const [hotelCommission, setHotelCommission] = useState<number>(10); // Default 10% commission (fallback)
  const [hotelComisiones, setHotelComisiones] = useState<HotelComision[]>([]);

  // Load hotel data from localStorage on mount
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;
    
    const code = localStorage.getItem('hotelCode');
    const name = localStorage.getItem('hotelName');
    const id = localStorage.getItem('hotelId');
    const commission = localStorage.getItem('hotelCommission');
    const comisiones = localStorage.getItem('hotelComisiones');
    
    if (code && name && id) {
      const parsedId = parseInt(id);
      if (!isNaN(parsedId)) {
        console.log('🏨 Cargando datos del hotel desde localStorage:', { code, name, id: parsedId });
        setIsHotel(true);
        setHotelName(name);
        setHotelCode(code);
        setHotelId(parsedId);
        if (commission) {
          setHotelCommission(parseFloat(commission));
        }
        if (comisiones) {
          try {
            setHotelComisiones(JSON.parse(comisiones));
          } catch (e) {
            console.error('Error parsing hotel comisiones:', e);
          }
        }
      }
    }
  }, []);

  const setHotel = (code: string, name: string, id: number, comisiones: HotelComision[], commission?: number) => {
    setIsHotel(true);
    setHotelName(name);
    setHotelCode(code);
    setHotelId(id);
    setHotelComisiones(comisiones);
    if (commission !== undefined) {
      setHotelCommission(commission);
    }
    // Store in localStorage to persist across page refreshes
    localStorage.setItem('hotelCode', code);
    localStorage.setItem('hotelName', name);
    localStorage.setItem('hotelId', id.toString());
    localStorage.setItem('hotelComisiones', JSON.stringify(comisiones));
    if (commission !== undefined) {
      localStorage.setItem('hotelCommission', commission.toString());
    } else {
      localStorage.setItem('hotelCommission', '10'); // Default 10%
    }
  };

  const clearHotel = () => {
    setIsHotel(false);
    setHotelName(null);
    setHotelCode(null);
    setHotelId(null);
    setHotelComisiones([]);
    localStorage.removeItem('hotelCode');
    localStorage.removeItem('hotelName');
    localStorage.removeItem('hotelId');
    localStorage.removeItem('hotelCommission');
    localStorage.removeItem('hotelComisiones');
  };

  const getComisionEspecifica = (servicio: string, vehiculoId: number): number => {
    const comision = hotelComisiones.find(
      (c) => c.servicio === servicio && c.vehiculoId === vehiculoId
    );
    return comision ? comision.comision : 0;
  };

  return (
    <HotelContext.Provider value={{ 
      isHotel, 
      hotelName, 
      hotelId, 
      hotelCode,
      hotelCommission, 
      hotelComisiones,
      setHotel, 
      clearHotel,
      getComisionEspecifica,
    }}>
      {children}
    </HotelContext.Provider>
  );
}

export function useHotel() {
  const context = useContext(HotelContext);
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider');
  }
  return context;
}


// Mock data for dashboard demo

export interface Reservation {
  id: string;
  code: string;
  service: string;
  date: string;
  time: string;
  from: string;
  to: string;
  passengers: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  channel: 'hotel' | 'airbnb' | 'direct';
  partner?: string;
  status: 'toBeQuoted' | 'toSchedule' | 'scheduled' | 'assigned' | 'onTheWay' | 'completed' | 'cancelled';
  driver?: string;
  vehicle?: string;
  quote?: number;
  notes?: string;
  createdAt: string;
}

export const mockReservations: Reservation[] = [
  {
    id: '1',
    code: 'MDL001',
    service: 'Traslado Aeropuerto',
    date: '2025-11-10',
    time: '14:30',
    from: 'Aeropuerto José María Córdova',
    to: 'Hotel Poblado Plaza',
    passengers: 2,
    customerName: 'Juan Pérez',
    customerPhone: '+57 300 123 4567',
    customerEmail: 'juan@example.com',
    channel: 'hotel',
    partner: 'Hotel Poblado Plaza',
    status: 'toBeQuoted',
    createdAt: '2025-11-02T10:00:00',
  },
  {
    id: '2',
    code: 'MDL002',
    service: 'City Tour',
    date: '2025-11-03',
    time: '09:00',
    from: 'Hotel Dann Carlton',
    to: 'Comuna 13',
    passengers: 4,
    customerName: 'Maria García',
    customerPhone: '+57 310 234 5678',
    customerEmail: 'maria@example.com',
    channel: 'direct',
    status: 'toSchedule',
    quote: 150000,
    createdAt: '2025-11-01T15:30:00',
  },
  {
    id: '3',
    code: 'MDL003',
    service: 'Traslado Aeropuerto',
    date: '2025-11-02',
    time: '16:00',
    from: 'Airbnb Laureles',
    to: 'Aeropuerto José María Córdova',
    passengers: 3,
    customerName: 'Carlos Rodríguez',
    customerPhone: '+57 320 345 6789',
    customerEmail: 'carlos@example.com',
    channel: 'airbnb',
    partner: 'Airbnb Laureles',
    status: 'assigned',
    driver: 'Pedro Gómez',
    vehicle: 'Van Mercedes',
    quote: 120000,
    createdAt: '2025-10-28T11:20:00',
  },
  {
    id: '5',
    code: 'MDL005',
    service: 'Traslado Aeropuerto',
    date: '2025-11-01',
    time: '10:30',
    from: 'Hotel Poblado',
    to: 'Aeropuerto',
    passengers: 2,
    customerName: 'Roberto Silva',
    customerPhone: '+57 310 567 8901',
    customerEmail: 'roberto@example.com',
    channel: 'direct',
    status: 'completed',
    driver: 'Pedro Gómez',
    vehicle: 'Auto Mercedes',
    quote: 110000,
    createdAt: '2025-10-28T16:00:00',
  },
];

export const mockDrivers = [
  {
    id: '1',
    name: 'Pedro Gómez',
    phone: '+57 300 111 2222',
    vehicle: 'Auto Mercedes',
    status: 'available' as const,
    rating: 4.8,
    completedServices: 145,
  },
  {
    id: '2',
    name: 'Luis Fernández',
    phone: '+57 310 222 3333',
    vehicle: 'Van Sprinter',
    status: 'occupied' as const,
    rating: 4.9,
    completedServices: 203,
  },
  {
    id: '3',
    name: 'Carlos Ríos',
    phone: '+57 320 333 4444',
    vehicle: 'Auto Toyota',
    status: 'available' as const,
    rating: 4.7,
    completedServices: 98,
  },
];

export const mockPartners = [
  {
    id: '1',
    name: 'Hotel Poblado Plaza',
    code: 'HPP2025',
    city: 'Medellín',
    type: 'hotel' as const,
    reservationsThisMonth: 23,
    cancellationRate: 5,
  },
  {
    id: '2',
    name: 'Hotel Dann Carlton',
    code: 'HDC2025',
    city: 'Medellín',
    type: 'hotel' as const,
    reservationsThisMonth: 31,
    cancellationRate: 3,
  },
];


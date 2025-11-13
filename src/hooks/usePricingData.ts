import { useState, useEffect } from 'react';

interface PrecioVehiculo {
  id: number;
  vehiculoId: number;
  pasajerosMin: number;
  pasajerosMax: number;
  precio: number;
  activo: boolean;
}

interface PrecioAdicional {
  id: number;
  tipo: string;
  rango: string | null;
  precio: number;
  activo: boolean;
}

interface ServiceData {
  id: number;
  codigo: string;
  nombreEs: string;
  nombreEn: string;
  descripcionCortaEs: string | null;
  descripcionCortaEn: string | null;
  descripcionCompletaEs: string | null;
  descripcionCompletaEn: string | null;
  imagenUrl: string | null;
  tipo: string;
  activo: boolean;
  configuracion?: {
    incluye?: string[];
    noIncluye?: string[];
    campos?: string[];
    camposPersonalizados?: Array<{
      label: string;
      type: string;
      necesitaValor?: boolean;
      precioPorPersona?: number;
    }>;
    preciosMunicipios?: Record<string, Record<string, number>>; // municipio -> capacidad -> precio
    preciosAdicionales?: Array<{
      tipo: string;
      rango?: string;
      precio: number;
      activo: boolean;
      label?: string;
    }>;
    precioAtv?: number;
    precioParapente?: number;
    precioMunicipioFee?: number;
  } | null;
}

interface Vehiculo {
  id: number;
  nombre: string;
  capacidadMin: number;
  capacidadMax: number;
  imagenUrl: string | null;
  tipo: string | null;
  activo: boolean;
}

interface PricingData {
  serviceData: ServiceData | null;
  preciosVehiculos: PrecioVehiculo[];
  preciosAdicionales: PrecioAdicional[];
  vehiculos: Vehiculo[];
  loading: boolean;
  error: string | null;
  // Helper functions
  getPrecioVehiculo: (pasajeros: number) => number;
  getPrecioAdicional: (tipo: string, rango?: string) => number;
  getMinPrecioVehiculo: () => number;
  getVehicleRanges: () => Array<{
    min: number;
    max: number;
    image: string;
    label: string;
    price: number;
    vehiculoId: number;
    vehiculoNombre: string;
  }>;
  getServiceConfig: () => ServiceData['configuracion'];
  getCustomFields: () => Array<{
    label: string;
    type: string;
    necesitaValor?: boolean;
    precioPorPersona?: number;
  }>;
  getStandardFields: () => string[];
  getMunicipioPrice: (municipio: string, capacityRange: string) => number;
  getAdditionalServicePrice: (tipo: string, rango?: string) => number;
  getAtvPrice: () => number;
  getParapentePrice: () => number;
  getMunicipioFee: () => number;
}

export function usePricingData(serviceId: string): PricingData {
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [preciosVehiculos, setPreciosVehiculos] = useState<PrecioVehiculo[]>([]);
  const [preciosAdicionales, setPreciosAdicionales] = useState<PrecioAdicional[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPricingData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/services');
        const data = await response.json();

        if (!data.success) {
          throw new Error('Failed to fetch services');
        }

        // Find the service by code
        const service = data.data.servicios.find((s: ServiceData) => s.codigo === serviceId);
        setServiceData(service || null);

        // Get vehicles
        if (data.data.vehiculos) {
          setVehiculos(data.data.vehiculos.filter((v: Vehiculo) => v.activo));
        }

        // Map service IDs to price keys
        const precioMap: Record<string, string> = {
          'airport-transfer': 'airport',
          'guatape-tour': 'guatapeVehiculos',
          'city-tour': 'cityTour',
          'graffiti-tour': 'graffiti',
          'hacienda-napoles-tour': 'haciendaNapoles',
          'occidente-tour': 'occidente',
          'parapente-tour': 'parapente',
          'atv-tour': 'atv',
          'jardin-tour': 'jardin',
          'coffee-farm-tour': 'coffeeFarm',
        };

        const precioKey = precioMap[serviceId];
        if (precioKey && data.data.precios[precioKey]) {
          setPreciosVehiculos(data.data.precios[precioKey]);
        } else if (data.data.precios.dinamicos && data.data.precios.dinamicos[serviceId]) {
          // Si no está en el mapeo, buscar en precios dinámicos
          setPreciosVehiculos(data.data.precios.dinamicos[serviceId]);
        }

        // Get additional prices for Guatapé
        if (serviceId === 'guatape-tour' && data.data.precios.guatapeAdicionales) {
          setPreciosAdicionales(data.data.precios.guatapeAdicionales);
        }
      } catch (err) {
        console.error('Error fetching pricing data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPricingData();
  }, [serviceId]);

  // Helper function to get vehicle price based on passenger count
  const getPrecioVehiculo = (pasajeros: number): number => {
    if (preciosVehiculos.length === 0) return 0;

    const precio = preciosVehiculos.find(
      (p) => pasajeros >= p.pasajerosMin && pasajeros <= p.pasajerosMax && p.activo
    );

    return precio ? Number(precio.precio) : 0;
  };

  // Helper function to get additional price by type and range
  const getPrecioAdicional = (tipo: string, rango?: string): number => {
    if (preciosAdicionales.length === 0) return 0;

    const precio = preciosAdicionales.find((p) => {
      if (tipo === 'bote' && rango) {
        return p.tipo === tipo && p.rango === rango && p.activo;
      }
      return p.tipo === tipo && p.activo;
    });

    return precio ? Number(precio.precio) : 0;
  };

  // Get minimum vehicle price
  const getMinPrecioVehiculo = (): number => {
    if (preciosVehiculos.length === 0) return 0;
    const activePrices = preciosVehiculos.filter((p) => p.activo);
    if (activePrices.length === 0) return 0;
    return Math.min(...activePrices.map((p) => Number(p.precio)));
  };

  // Get vehicle ranges dynamically from database
  // Only returns vehicles that have been configured with prices for this service
  const getVehicleRanges = () => {
    if (preciosVehiculos.length === 0 || vehiculos.length === 0) return [];

    return preciosVehiculos
      .filter((p) => p.activo)
      .map((precio) => {
        const vehiculo = vehiculos.find((v) => v.id === precio.vehiculoId);
        if (!vehiculo) return null;
        
        // Use the actual vehicle capacities, not the price range
        return {
          min: vehiculo.capacidadMin,
          max: vehiculo.capacidadMax,
          image: vehiculo.imagenUrl || '/1-3.png', // Fallback image
          label: `${vehiculo.nombre} (${vehiculo.capacidadMin} - ${vehiculo.capacidadMax} personas)`,
          price: Number(precio.precio),
          vehiculoId: precio.vehiculoId,
          vehiculoNombre: vehiculo.nombre,
        };
      })
      .filter((v): v is NonNullable<typeof v> => v !== null) // Remove nulls
      .sort((a, b) => a.min - b.min); // Sort by min capacity
  };

  // Get service configuration
  const getServiceConfig = () => {
    return serviceData?.configuracion || null;
  };

  // Get custom fields from configuration
  const getCustomFields = () => {
    return serviceData?.configuracion?.camposPersonalizados || [];
  };

  // Get standard fields from configuration
  const getStandardFields = () => {
    return serviceData?.configuracion?.campos || [];
  };

  // Get municipality price dynamically from configuration
  const getMunicipioPrice = (municipio: string, capacityRange: string): number => {
    if (!municipio || municipio === 'otro') return 0;
    const config = serviceData?.configuracion;
    if (config?.preciosMunicipios && config.preciosMunicipios[municipio.toLowerCase()]) {
      return config.preciosMunicipios[municipio.toLowerCase()][capacityRange] || 0;
    }
    return 0;
  };

  // Get additional service price from dynamic configuration
  const getAdditionalServicePrice = (tipo: string, rango?: string): number => {
    const config = serviceData?.configuracion;
    if (config?.preciosAdicionales && Array.isArray(config.preciosAdicionales)) {
      const precio = config.preciosAdicionales.find(
        (p) => p.tipo === tipo && p.activo && (!rango || p.rango === rango)
      );
      if (precio) {
        return Number(precio.precio) || 0;
      }
    }
    // Fallback to old preciosAdicionales (only if getPrecioAdicional is available)
    try {
      return getPrecioAdicional(tipo, rango);
    } catch (error) {
      return 0;
    }
  };

  // Get ATV price from configuration
  const getAtvPrice = (): number => {
    return serviceData?.configuracion?.precioAtv || 300000; // Default fallback
  };

  // Get Parapente price from configuration
  const getParapentePrice = (): number => {
    return serviceData?.configuracion?.precioParapente || 250000; // Default fallback
  };

  // Get municipality fee from configuration
  const getMunicipioFee = (): number => {
    return serviceData?.configuracion?.precioMunicipioFee || 10000; // Default fallback
  };

  return {
    serviceData,
    preciosVehiculos,
    preciosAdicionales,
    vehiculos,
    loading,
    error,
    getPrecioVehiculo,
    getPrecioAdicional,
    getMinPrecioVehiculo,
    getVehicleRanges,
    getServiceConfig,
    getCustomFields,
    getStandardFields,
    getMunicipioPrice,
    getAdditionalServicePrice,
    getAtvPrice,
    getParapentePrice,
    getMunicipioFee,
  };
}


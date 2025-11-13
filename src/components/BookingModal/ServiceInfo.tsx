'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState, useEffect } from 'react';

interface ServiceInfoProps {
  serviceId: string;
  serviceDescription: string;
  onNext: () => void;
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
    preciosVehiculos?: Array<{
      vehiculoId: number;
      precio: number;
      pasajerosMin?: number;
      pasajerosMax?: number;
    }>;
    [key: string]: any;
  };
}

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

export default function ServiceInfo({ serviceId, serviceDescription, onNext }: ServiceInfoProps) {
  const { t, language } = useLanguage();
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [preciosVehiculos, setPreciosVehiculos] = useState<PrecioVehiculo[]>([]);
  const [preciosAdicionales, setPreciosAdicionales] = useState<PrecioAdicional[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch service data from API
  useEffect(() => {
    const fetchServiceData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.success) {
          // Find the service by code
          const service = data.data.servicios.find((s: ServiceData) => s.codigo === serviceId);
          setServiceData(service || null);
          
          // Get vehicle prices for this service
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
          }
          
          // Get additional prices for Guatapé
          if (serviceId === 'guatape-tour' && data.data.precios.guatapeAdicionales) {
            setPreciosAdicionales(data.data.precios.guatapeAdicionales);
          }
        }
      } catch (error) {
        console.error('Error fetching service data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [serviceId]);

  // Get base price for the service (minimum vehicle price)
  const getBasePrice = (): number => {
    if (preciosVehiculos.length === 0) return 0;
    
    // Find the minimum price
    const minPrice = Math.min(...preciosVehiculos.map(p => Number(p.precio)));
    return minPrice;
  };

  // Fetch USD to COP exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setUsdRate(data.rates.COP || 4000);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setUsdRate(4000);
      }
    };
    
    if (language === 'en') {
      fetchExchangeRate();
    }
  }, [language]);

  // Format price in COP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Convert COP to USD
  const convertToUSD = (cop: number): string => {
    if (!usdRate) return '';
    const usd = cop / usdRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usd);
  };

  const basePrice = getBasePrice();

  // Get inclusions dynamically from service configuration
  const getInclusions = (): string[] => {
    if (!serviceData?.configuracion?.incluye) {
      return [];
    }
    // Filter out empty strings
    return serviceData.configuracion.incluye.filter((item: string) => item && item.trim() !== '');
  };

  // Get exclusions dynamically from service configuration
  const getExclusions = (): string[] => {
    if (!serviceData?.configuracion?.noIncluye) {
      return [];
    }
    // Filter out empty strings
    return serviceData.configuracion.noIncluye.filter((item: string) => item && item.trim() !== '');
  };

  // Format additional services from database (both from old tables and new dynamic config)
  const getAdditionalServices = (): string[] => {
    const services: string[] = [];
    
    // Get from old preciosAdicionales (for Guatapé tour legacy)
    if (preciosAdicionales.length > 0) {
    // Group by type
    const botes = preciosAdicionales.filter(p => p.tipo === 'bote');
    const almuerzos = preciosAdicionales.filter(p => p.tipo === 'almuerzo');
    const guiaEspanol = preciosAdicionales.find(p => p.tipo === 'guia_espanol');
    const guiaIngles = preciosAdicionales.find(p => p.tipo === 'guia_ingles');
    
    // Format bote prices
    if (botes.length > 0) {
      const boteTexts = botes.map(b => `${b.rango} personas: $${formatPrice(Number(b.precio))}`).join(' | ');
      services.push(`Vuelta en bote (${boteTexts})`);
    }
    
    // Format lunch prices
    if (almuerzos.length > 0) {
      const almuerzo = almuerzos[0];
      services.push(`Almuerzo a la carta ($${formatPrice(Number(almuerzo.precio))} por persona)`);
    }
    
    // Format guide prices
    if (guiaEspanol || guiaIngles) {
      const guiaTexts: string[] = [];
      if (guiaEspanol) {
        guiaTexts.push(`Español: $${formatPrice(Number(guiaEspanol.precio))}`);
      }
      if (guiaIngles) {
        guiaTexts.push(`Inglés: $${formatPrice(Number(guiaIngles.precio))}`);
      }
      services.push(`Guía acompañante certificado (${guiaTexts.join(' | ')})`);
      }
    }
    
    // Get from dynamic configuracion.preciosAdicionales if available
    if (serviceData?.configuracion?.preciosAdicionales && Array.isArray(serviceData.configuracion.preciosAdicionales)) {
      serviceData.configuracion.preciosAdicionales.forEach((precioAdicional: any) => {
        if (precioAdicional.activo && precioAdicional.tipo && precioAdicional.precio) {
          let serviceText = '';
          if (precioAdicional.tipo === 'bote' && precioAdicional.rango) {
            serviceText = `Vuelta en bote (${precioAdicional.rango} personas: $${formatPrice(Number(precioAdicional.precio))})`;
          } else if (precioAdicional.tipo === 'almuerzo') {
            serviceText = `Almuerzo a la carta ($${formatPrice(Number(precioAdicional.precio))} por persona)`;
          } else if (precioAdicional.tipo === 'guia_espanol') {
            serviceText = `Guía acompañante certificado (Español: $${formatPrice(Number(precioAdicional.precio))})`;
          } else if (precioAdicional.tipo === 'guia_ingles') {
            serviceText = `Guía acompañante certificado (Inglés: $${formatPrice(Number(precioAdicional.precio))})`;
          } else if (precioAdicional.label) {
            // Generic additional service with label
            serviceText = precioAdicional.rango 
              ? `${precioAdicional.label} (${precioAdicional.rango}: $${formatPrice(Number(precioAdicional.precio))})`
              : `${precioAdicional.label} ($${formatPrice(Number(precioAdicional.precio))})`;
          }
          if (serviceText) {
            services.push(serviceText);
          }
        }
      });
    }
    
    return services;
  };

  const inclusions = getInclusions();
  const exclusions = getExclusions();
  const additionalServices = getAdditionalServices();

  // Get description from service data or fallback to prop
  const getDescription = () => {
    if (!serviceData) return serviceDescription;
    
    if (language === 'es') {
      return serviceData.descripcionCompletaEs || serviceData.descripcionCortaEs || serviceDescription;
    } else {
      return serviceData.descripcionCompletaEn || serviceData.descripcionCortaEn || serviceDescription;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Description */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">
          {t('aboutThisService')}
        </h3>
        <p className="text-gray-700 leading-relaxed text-base mb-4">
          {getDescription()}
        </p>
      </div>

      {/* Additional Services (for Guatapé tour) */}
      {additionalServices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
              +
            </span>
            {t('whatAdditional')}
          </h4>
          <ul className="space-y-3">
            {additionalServices.map((service, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-gray-700"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xs">+</span>
                  </div>
                </div>
                <span className="flex-1 leading-relaxed">{service}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Inclusions Checklist */}
      {inclusions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            {t('whatIncluded')}
          </h4>
          <ul className="space-y-3">
            {inclusions.map((inclusion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-gray-700"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600" />
                  </div>
                </div>
                <span className="flex-1 leading-relaxed">{inclusion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Exclusions Checklist */}
      {exclusions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h4 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
              ✕
            </span>
            {language === 'es' ? 'Qué NO incluye' : 'What\'s NOT included'}
          </h4>
          <ul className="space-y-3">
            {exclusions.map((exclusion, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 text-gray-700"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold text-xs">✕</span>
                  </div>
                </div>
                <span className="flex-1 leading-relaxed">{exclusion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA Button */}
      <div className="pt-4">
        <button
          onClick={onNext}
          className="w-full py-4 bg-black text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-transform min-h-[56px]"
        >
          {t('letsGo')}
        </button>
      </div>
    </motion.div>
  );
}

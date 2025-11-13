'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePricingData } from '@/hooks/usePricingData';
import { BookingData } from './index';
import { MapPin, Calendar, Clock, Users, Plane, ChevronLeft, Check, Globe, MessageCircle } from 'lucide-react';
import Image from 'next/image';

interface TripDetailsProps {
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack?: () => void;
  serviceId: string;
  serviceName?: string;
}

// All vehicle ranges are now dynamically loaded from the database via usePricingData hook
// No hardcoded ranges - only vehicles configured in the panel for each service will be available

export default function TripDetails({ data, updateData, onNext, onBack, serviceId, serviceName }: TripDetailsProps) {
  const { t, language } = useLanguage();
  const [direction, setDirection] = useState<'to' | 'from' | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<'jmc' | 'olaya' | null>(null);
  const [passengerInput, setPassengerInput] = useState<string>('');
  const [isPassengerInputFocused, setIsPassengerInputFocused] = useState<boolean>(false);
  
  // Service type flags (defined early to avoid reference errors)
  const isAirportTransfer = serviceId === 'airport-transfer';
  const isCustomTransport = serviceId === 'custom-transport';
  const isTour = serviceId.includes('-tour');
  
  // Get dynamic pricing data from database
  const { getPrecioVehiculo, getPrecioAdicional, getVehicleRanges, preciosVehiculos, loading: pricingLoading, getCustomFields, getStandardFields, getMunicipioPrice, getAdditionalServicePrice, getAtvPrice, getParapentePrice, getMunicipioFee } = usePricingData(serviceId);
  
  // Get fields from service configuration
  const customFields = getCustomFields();
  const standardFields = getStandardFields();
  
  // State for custom field values
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  
  // Map of field IDs to data properties and labels
  const fieldMap: Record<string, { prop: string; labelEs: string; labelEn: string; type: string }> = {
    lugarRecogida: { prop: 'from', labelEs: 'Lugar de recogida', labelEn: 'Pickup location', type: 'text' },
    destino: { prop: 'to', labelEs: 'Destino', labelEn: 'Destination', type: 'text' },
    fecha: { prop: 'date', labelEs: 'Fecha', labelEn: 'Date', type: 'date' },
    hora: { prop: 'time', labelEs: 'Hora', labelEn: 'Time', type: 'time' },
    numeroPasajeros: { prop: 'passengers', labelEs: 'Número de pasajeros', labelEn: 'Number of passengers', type: 'number' },
    idiomaTour: { prop: 'tourLanguage', labelEs: 'Idioma del tour', labelEn: 'Tour language', type: 'select' },
    guiaCertificado: { prop: 'wantsGuide', labelEs: 'Guía certificado', labelEn: 'Certified guide', type: 'checkbox' },
    numeroVuelo: { prop: 'flightNumber', labelEs: 'Número de vuelo', labelEn: 'Flight number', type: 'text' },
    listaAsistentes: { prop: 'assistants', labelEs: 'Lista de asistentes', labelEn: 'Attendees list', type: 'list' },
    notasAdicionales: { prop: 'notes', labelEs: 'Notas adicionales', labelEn: 'Additional notes', type: 'textarea' },
    municipio: { prop: 'municipio', labelEs: 'Municipio', labelEn: 'Municipality', type: 'select' },
  };
  
  // Get the appropriate vehicle ranges based on service - ONLY from database
  // No hardcoded fallbacks - only vehicles configured in the panel for this service
  const getVehicleRangesForService = () => {
    const dynamicRanges = getVehicleRanges();
    // Only return vehicles that have been configured with prices in the panel
    return dynamicRanges;
  };
  
  // Get vehicle image based on passenger count
  const getVehicleForPassengers = (passengers: number) => {
    if (!passengers || passengers < 1) return null;
    const ranges = getVehicleRangesForService();
    if (ranges.length === 0) return null;
    // Find the first vehicle that can accommodate the number of passengers
    // Only return vehicles that have been configured with prices
    return ranges.find(range => passengers >= range.min && passengers <= range.max && range.price > 0) || null;
  };

  // Get min and max passengers from available vehicles
  const getMinMaxPassengers = () => {
    const ranges = getVehicleRangesForService();
    if (ranges.length === 0) return { min: 1, max: 40 };
    const min = Math.min(...ranges.map(r => r.min));
    const max = Math.max(...ranges.map(r => r.max));
    return { min, max };
  };

  // Check if passengers count is valid for available vehicles
  const isValidPassengerCount = (passengers: number) => {
    if (!passengers || passengers < 1) return false;
    const ranges = getVehicleRangesForService();
    if (ranges.length === 0) return false;
    return ranges.some(range => passengers >= range.min && passengers <= range.max && range.price > 0);
  };
  
  // Get current vehicle based on passengers or selected upgrade
  const getCurrentVehicle = () => {
    const ranges = getVehicleRangesForService();
    if (data.selectedVehicle) {
      // If user selected an upgrade, use that (match by image URL or vehiculoId)
      const selected = ranges.find(v => {
        const matchImage = v.image === data.selectedVehicle;
        const matchVehiculoId = 'vehiculoId' in v && v.vehiculoId?.toString() === data.selectedVehicle;
        return matchImage || matchVehiculoId;
      });
      if (selected) return selected;
    }
    // Otherwise use the vehicle that matches passenger count
    const vehicle = getVehicleForPassengers(data.passengers);
    return vehicle || null;
  };
  
  // Get available upgrade options (larger vehicles)
  const getUpgradeOptions = () => {
    if (!data.passengers || data.passengers < 1) return [];
    const ranges = getVehicleRangesForService();
    if (ranges.length === 0) return [];
    const currentVehicle = getVehicleForPassengers(data.passengers);
    if (!currentVehicle) return [];
    const currentIndex = ranges.findIndex(v => v.min === currentVehicle.min && v.max === currentVehicle.max);
    if (currentIndex === -1 || currentIndex === ranges.length - 1) {
      return []; // No upgrades available
    }
    return ranges.slice(currentIndex + 1);
  };
  
  // Format price in COP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Boat ride prices - now from database
  const getBoatRidePrice = (boatRide: string): number => {
    return getPrecioAdicional('bote', boatRide);
  };
  
  // Lunch price per person - now from database
  const getLunchPricePerPerson = (): number => {
    return getPrecioAdicional('almuerzo');
  };
  
  // Guide prices - now from database
  const getGuidePrice = (tourLanguage: string): number => {
    return getPrecioAdicional(tourLanguage === 'spanish' ? 'guia_espanol' : 'guia_ingles');
  };
  
  // Get vehicle capacity range based on passenger count
    const getVehicleCapacityRange = (passengers: number): string => {
      if (passengers >= 1 && passengers <= 3) return '1-3';
      if (passengers === 4) return '4-4';
      if (passengers >= 5 && passengers <= 8) return '5-8';
      if (passengers >= 9 && passengers <= 15) return '9-15';
      if (passengers >= 16 && passengers <= 18) return '16-18';
      if (passengers >= 19 && passengers <= 25) return '19-25';
      return '1-3'; // Default
    };

  // Get municipality price for any service (dynamic from config)
  const getMunicipioPriceForService = (municipio: string, passengers: number): number => {
    // Si es "otro" municipio, no calcular precio (pendiente de cotización)
    if (!municipio || municipio === 'otro') {
      return 0;
    }
    
    // Check if getMunicipioPrice is available
    if (!getMunicipioPrice || typeof getMunicipioPrice !== 'function') {
      return 0;
    }
    
    const capacityRange = getVehicleCapacityRange(passengers);
    
    // Get price dynamically from service configuration
    return getMunicipioPrice(municipio, capacityRange);
  };
    
  // Airport Transfer: Get price by municipality and vehicle capacity (now dynamic from config)
  const getAirportTransferPrice = (municipio: string, passengers: number): number => {
    return getMunicipioPriceForService(municipio, passengers);
  };
  
  // Calculate total price
  const calculateTotalPrice = () => {
    // Si el municipio es "otro" y hay un municipioOtro escrito, NO dar cotización
    // Retornar 0 para indicar que está pendiente de cotización
    if (data.municipio === 'otro' && data.municipioOtro && data.municipioOtro.trim() !== '') {
      return 0; // Pendiente de cotización
    }
    
    let total = 0;
    
    // Vehicle price - from database (configured in panel for each service)
    // This applies to ALL services including airport-transfer
    const currentVehicle = getCurrentVehicle();
    if (currentVehicle && data.passengers > 0) {
      // Use the price from the vehicle object (from database)
      const vehiclePrice = currentVehicle.price || 0;
      if (vehiclePrice > 0) {
        total += vehiclePrice;
      }
    }
    
    // Airport Transfer: Precio adicional basado en municipio y capacidad
    // Este precio se suma AL precio del vehículo
    if (serviceId === 'airport-transfer') {
      if (data.municipio && data.municipio !== 'otro' && data.passengers > 0) {
        const airportPrice = getAirportTransferPrice(data.municipio, data.passengers);
        total += airportPrice;
      }
      return total;
    }
    
    // Boat ride
    if (data.boatRide) {
      total += getBoatRidePrice(data.boatRide);
    }
    
    // Lunch
    if (data.lunchCount && parseInt(data.lunchCount) > 0) {
      total += getLunchPricePerPerson() * parseInt(data.lunchCount);
    }
    
    // Certified Guide
    if (data.wantsGuide && data.tourLanguage) {
      total += getGuidePrice(data.tourLanguage);
    }
    
    // ATV motorcycles (dynamic price from config)
    if (serviceId === 'atv-tour' && data.atvCount && parseInt(data.atvCount) > 0) {
      total += getAtvPrice() * parseInt(data.atvCount);
    }
    
    // Parapente entries (dynamic price from config)
    if (serviceId === 'parapente-tour' && data.parapenteCount && parseInt(data.parapenteCount) > 0) {
      total += getParapentePrice() * parseInt(data.parapenteCount);
    }
    
    // Municipio price para todos los servicios (dynamic price from config, solo si NO es "otro")
    if (data.municipio && data.municipio !== 'otro' && data.passengers > 0) {
      const municipioPrice = getMunicipioPriceForService(data.municipio, data.passengers);
      if (municipioPrice > 0) {
        // Si hay precio configurado para el municipio, usarlo
        total += municipioPrice;
      } else if (getMunicipioFee && typeof getMunicipioFee === 'function') {
        // Si no hay precio específico, usar el fee por defecto
        total += getMunicipioFee();
      }
    }
    
    // Custom fields with price per person
    const currentCustomFields = (data as any).customFields || customFieldValues;
    customFields.forEach((field, index) => {
      if (field.necesitaValor && field.precioPorPersona) {
        const fieldKey = `custom_${index}_${field.label}`;
        const fieldValue = currentCustomFields[fieldKey] || '';
        const cantidad = parseInt(fieldValue) || 0;
        if (cantidad > 0) {
          total += cantidad * field.precioPorPersona;
        }
      }
    });
    
    return total;
  };
  
  // Update prices when relevant data changes
  useEffect(() => {
    // Only run if pricing data is loaded
    if (pricingLoading) return;
    
    if (isTour || serviceId === 'airport-transfer') {
      try {
      const currentVehicle = getCurrentVehicle();
      // Use price from database (vehicle price configured in panel)
      const vehiclePrice = currentVehicle?.price || 0;
      
      // Calculate additional services price
      let additionalPrice = 0;
        if (data.boatRide && getBoatRidePrice) {
        additionalPrice += getBoatRidePrice(data.boatRide);
      }
        if (data.lunchCount && parseInt(data.lunchCount) > 0 && getLunchPricePerPerson) {
        additionalPrice += getLunchPricePerPerson() * parseInt(data.lunchCount);
      }
      // Certified Guide
        if (data.wantsGuide && data.tourLanguage && getGuidePrice) {
        additionalPrice += getGuidePrice(data.tourLanguage);
      }
      
        // ATV motorcycles (dynamic price from config)
        if (serviceId === 'atv-tour' && data.atvCount && parseInt(data.atvCount) > 0 && getAtvPrice) {
          additionalPrice += getAtvPrice() * parseInt(data.atvCount);
      }
      
        // Parapente entries (dynamic price from config)
        if (serviceId === 'parapente-tour' && data.parapenteCount && parseInt(data.parapenteCount) > 0 && getParapentePrice) {
          additionalPrice += getParapentePrice() * parseInt(data.parapenteCount);
      }
      
      const totalPrice = calculateTotalPrice();
      
      const minPassengers = (serviceId === 'city-tour' || serviceId === 'graffiti-tour' || serviceId === 'hacienda-napoles-tour' || serviceId === 'atv-tour' || serviceId === 'coffee-farm-tour' || serviceId === 'parapente-tour' || serviceId === 'jardin-tour' || serviceId === 'occidente-tour' || serviceId === 'airport-transfer') ? 1 : 4;
      
        // Para Airport Transfer, el precio del vehículo es el precio base del vehículo
        // El precio del municipio se suma en calculateTotalPrice()
        // No sobrescribir vehiclePrice con el precio del municipio
      let finalVehiclePrice = vehiclePrice;
      
      updateData({
        basePrice: 0, // Base price is now included in vehicle price
        vehiclePrice: finalVehiclePrice,
        additionalServicesPrice: additionalPrice,
        totalPrice: totalPrice,
      });
      } catch (error) {
        console.error('Error calculating prices:', error);
    }
    }
  }, [data.passengers, data.selectedVehicle, data.boatRide, data.lunchCount, data.wantsGuide, data.tourLanguage, data.atvCount, data.parapenteCount, data.municipio, serviceId, preciosVehiculos, customFieldValues, customFields, pricingLoading]);
  
  // Convert 24h time to 12h format
  const convert24to12 = (time24: string): { hour: number; minute: number; period: 'AM' | 'PM' } => {
    if (!time24) return { hour: 12, minute: 0, period: 'PM' };
    const [hour24, minute] = time24.split(':').map(Number);
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return { hour: hour12, minute: minute || 0, period };
  };

  // Convert 12h format to 24h for time input
  const convert12to24 = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 = hour + 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // Handle time input for mobile (time picker)
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time24 = e.target.value;
    if (time24) {
      const { hour, minute, period } = convert24to12(time24);
      updateData({ 
        time: `${hour}:${String(minute).padStart(2, '0')}`,
        timePeriod: period
      });
    }
  };

  // Handle manual time input for desktop (1-12 format)
  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove non-numeric characters except colon
    value = value.replace(/[^\d:]/g, '');
    
    // Handle hour input (1-12)
    if (value.includes(':')) {
      const [hourStr, minuteStr] = value.split(':');
      const hour = parseInt(hourStr) || 0;
      const minute = parseInt(minuteStr) || 0;
      
      // Validate hour (1-12)
      if (hourStr && (hour < 1 || hour > 12)) {
        return; // Don't update if invalid
      }
      
      // Validate minute (0-59)
      if (minuteStr && (minute < 0 || minute > 59)) {
        return; // Don't update if invalid
      }
      
      // Format minute to 2 digits max
      if (minuteStr && minuteStr.length > 2) {
        return;
      }
      
      updateData({ time: value });
    } else {
      // Only hour entered, validate 1-12
      const hour = parseInt(value) || 0;
      if (value === '' || (hour >= 1 && hour <= 12)) {
        updateData({ time: value });
      }
    }
  };
  

  // Sincronizar passengerInput con data.passengers solo cuando el campo no está enfocado
  useEffect(() => {
    if (!isPassengerInputFocused) {
      if (data.passengers > 0) {
        setPassengerInput(data.passengers.toString());
      } else {
        setPassengerInput('');
      }
    }
  }, [data.passengers, isPassengerInputFocused]);
  
  // Update vehicle image when passengers change
  useEffect(() => {
    const minPassengers = (serviceId === 'city-tour' || serviceId === 'graffiti-tour' || serviceId === 'hacienda-napoles-tour' || serviceId === 'atv-tour' || serviceId === 'coffee-farm-tour' || serviceId === 'parapente-tour' || serviceId === 'jardin-tour' || serviceId === 'occidente-tour') ? 1 : 4;
    if (data.passengers && data.passengers >= minPassengers) {
      const ranges = getVehicleRangesForService();
      const vehicle = getVehicleForPassengers(data.passengers);
      if (vehicle) {
        // Check if selected vehicle is still valid (larger than or equal to current)
        const selectedVehicleRange = data.selectedVehicle 
          ? ranges.find(v => v.image === data.selectedVehicle)
          : null;
        
        const shouldKeepSelection = selectedVehicleRange && 
          selectedVehicleRange.min >= vehicle.min;
        
        updateData({ 
          vehicleImage: shouldKeepSelection ? data.selectedVehicle! : vehicle.image,
          selectedVehicle: shouldKeepSelection ? data.selectedVehicle : ''
        });
      }
    } else {
      // Clear vehicle image if less than minimum passengers
      updateData({ 
        vehicleImage: '',
        selectedVehicle: ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.passengers, serviceId, preciosVehiculos]);

  // Auto-fill destination for tours
  useEffect(() => {
    if (isTour && !data.to) {
      // Get the service name from the translation
      const tourNames: { [key: string]: string } = {
        'guatape-tour': t('guatapeTour'),
        'graffiti-tour': t('graffitiTour'),
        'city-tour': t('cityTour'),
        'hacienda-napoles-tour': t('haciendaNapolesTour'),
        'occidente-tour': t('occidenteTour'),
        'parapente-tour': t('parapenteTour'),
        'atv-tour': t('atvTour'),
        'jardin-tour': t('jardinTour'),
      };
      const tourName = tourNames[serviceId] || serviceId;
      updateData({ to: tourName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTour, serviceId]);

  // Handle airport selection
  const handleDirectionSelect = (dir: 'to' | 'from') => {
    // First, clear the previously selected airport field if direction is changing
    const airportPrefix = language === 'es' ? 'Aeropuerto' : 'Airport';
    const airportPrefixLower = airportPrefix.toLowerCase();
    
    const updates: Partial<BookingData> = {};
    
    // If we had a previous direction and it was different, clear the airport field
    if (direction !== null && direction !== dir) {
      // Previous direction was opposite, so clear the field that was filled
      if (direction === 'from') {
        // Was coming from airport (origin was filled), now going to airport
        // Clear origin if it contains airport
        if (data.from && data.from.toLowerCase().includes(airportPrefixLower)) {
          updates.from = '';
        }
      } else {
        // Was going to airport (destination was filled), now coming from airport
        // Clear destination if it contains airport
        if (data.to && data.to.toLowerCase().includes(airportPrefixLower)) {
          updates.to = '';
        }
      }
    }
    
    // Always clear the field that will be auto-filled with the new airport selection
    if (dir === 'to') {
      updates.to = '';
    } else {
      updates.from = '';
    }
    
    // Update state
    setDirection(dir);
    setSelectedAirport(null);
    updateData(updates);
  };

  const handleAirportSelect = (airport: 'jmc' | 'olaya') => {
    setSelectedAirport(airport);
    let airportName = '';
    // Use "Airport" in English, "Aeropuerto" in Spanish
    const airportPrefix = language === 'es' ? 'Aeropuerto' : 'Airport';
    if (airport === 'jmc') {
      airportName = `${airportPrefix} ${t('airportJMC')} (${t('airportJMCSub')})`;
    } else {
      airportName = `${airportPrefix} ${t('airportOlaya')} (${t('airportOlayaSub')})`;
    }
    
    if (direction === 'to') {
      updateData({ to: airportName });
    } else if (direction === 'from') {
      updateData({ from: airportName });
    }
  };

  // Get dynamic min passengers from available vehicles
  const { min: minPassengers, max: maxPassengers } = getMinMaxPassengers();
  
  const isValid = 
    (isCustomTransport ? (data.hoursNeeded && parseInt(data.hoursNeeded) >= 4) : (data.from && data.to)) &&
    data.date && data.time && 
    isValidPassengerCount(data.passengers) && // Use dynamic validation
    (!isAirportTransfer || (direction !== null && selectedAirport !== null)) &&
    (!isTour || data.to !== ''); // For tours, destination should be filled

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar que el número de pasajeros tenga un vehículo disponible
    if (!isValidPassengerCount(data.passengers)) {
      return; // Don't proceed if no vehicle available
    }
    if (isValid) {
      onNext();
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <h3 className="text-2xl font-semibold">
        {isAirportTransfer ? t('airportTransportTitle') : isCustomTransport ? t('customTransport') : `${t('from')} → ${t('to')}`}
      </h3>
        {/* Botón para múltiples lugares de recogida */}
        <button
          type="button"
          onClick={() => {
            const servicioNombre = serviceName || 'este servicio';
            const message = encodeURIComponent(`Hola, necesito el servicio ${servicioNombre} con múltiples recogidas`);
            window.open(`https://wa.me/573175177409?text=${message}`, '_blank');
          }}
          className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
          title="Contactar por WhatsApp para múltiples lugares de recogida"
        >
          <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
          <span className="hidden sm:inline">Múltiples recogidas</span>
          <span className="sm:hidden">Múltiples</span>
        </button>
      </div>

      {/* Airport Transfer Special Selection */}
      {isAirportTransfer && (
        <>
          {/* Direction Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">
              {t('airportDirectionQuestion')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDirectionSelect('to')}
                className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] ${
                  direction === 'to'
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-200 hover:border-black'
                }`}
              >
                {t('toAirport')}
              </button>
              <button
                type="button"
                onClick={() => handleDirectionSelect('from')}
                className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] ${
                  direction === 'from'
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-200 hover:border-black'
                }`}
              >
                {t('fromAirport')}
              </button>
            </div>
          </div>

          {/* Airport Selection */}
          {direction !== null && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">
                {t('selectAirport')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAirportSelect('jmc')}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] text-left ${
                    selectedAirport === 'jmc'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 hover:border-black'
                  }`}
                >
                  {t('airportJMC')}
                  <br />
                  <span className="text-xs opacity-80">{t('airportJMCSub')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAirportSelect('olaya')}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] text-left ${
                    selectedAirport === 'olaya'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 hover:border-black'
                  }`}
                >
                  {t('airportOlaya')}
                  <br />
                  <span className="text-xs opacity-80">{t('airportOlayaSub')}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Custom Transport: Hours Needed */}
      {isCustomTransport ? (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            {t('hoursNeeded')}
          </label>
          <input
            type="number"
            min="4"
            max="24"
            value={data.hoursNeeded}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseInt(value) >= 4 && parseInt(value) <= 24)) {
                updateData({ hoursNeeded: value });
              }
            }}
            placeholder={t('hoursNeededPlaceholder')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
            style={{ fontSize: '16px' }}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'es' 
              ? 'Especifica la cantidad de horas que necesitas el servicio disponible. Mínimo 4 horas.'
              : 'Specify the number of hours you need the service available. Minimum 4 hours.'}
          </p>
        </div>
      ) : (
        <>
      {/* Tour Language - Only for tours */}
      {isTour && (
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Globe className="w-4 h-4" />
              {t('tourLanguage')}
            </label>
            <div className="relative">
              <select
                value={data.tourLanguage || 'spanish'}
                onChange={(e) => updateData({ tourLanguage: e.target.value as 'spanish' | 'english' })}
                className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] appearance-none bg-white cursor-pointer hover:border-gray-300"
                style={{ fontSize: '16px' }}
              >
                <option value="spanish">{t('tourLanguageSpanish')}</option>
                <option value="english">{t('tourLanguageEnglish')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Certified Guide Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="wantsGuide"
              checked={data.wantsGuide || false}
              onChange={(e) => updateData({ wantsGuide: e.target.checked })}
              className="mt-1 w-5 h-5 text-black border-2 border-gray-300 rounded focus:ring-2 focus:ring-black cursor-pointer"
            />
            <label htmlFor="wantsGuide" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium text-gray-900 block mb-1">
                {t('wantsCertifiedGuide')}
              </span>
              {data.wantsGuide && data.tourLanguage && (
                <span className="text-xs text-gray-600">
                  {data.tourLanguage === 'spanish' 
                    ? 'Guía en Español' + ` (+${formatPrice(getGuidePrice('spanish'))} COP)`
                    : 'Guía en Inglés' + ` (+${formatPrice(getGuidePrice('english'))} COP)`
                  }
                </span>
              )}
            </label>
          </div>
          {data.wantsGuide && data.tourLanguage && (
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                {data.tourLanguage === 'spanish' 
                  ? `+${formatPrice(getGuidePrice('spanish'))} COP`
                  : `+${formatPrice(getGuidePrice('english'))} COP`
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* From */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          {t('from')}
        </label>
        <input
          type="text"
          value={data.from}
              onChange={(e) => {
                if (!isAirportTransfer || direction !== 'from') {
                  updateData({ from: e.target.value });
                }
              }}
              placeholder={isAirportTransfer && direction === 'from' ? t('selectAirportAbove') : t('fromPlaceholder')}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] ${
                isAirportTransfer && direction === 'from' ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              style={{ fontSize: '16px' }}
              required={!isCustomTransport}
              disabled={isAirportTransfer && direction === 'from'}
        />
      </div>

      {/* To */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          {t('to')}
        </label>
        <input
          type="text"
          value={data.to}
              onChange={(e) => {
                if (!isAirportTransfer && !isTour) {
                  if (direction !== 'to') {
                    updateData({ to: e.target.value });
                  }
                }
              }}
              placeholder={isAirportTransfer && direction === 'to' ? t('selectAirportAbove') : t('toPlaceholder')}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] ${
                (isAirportTransfer && direction === 'to') || isTour ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              style={{ fontSize: '16px' }}
              required={!isCustomTransport}
              disabled={(isAirportTransfer && direction === 'to') || isTour}
        />
      </div>

      {/* Municipio */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          ¿En qué municipio te encuentras?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: 'envigado', label: 'Envigado' },
            { value: 'sabaneta', label: 'Sabaneta' },
            { value: 'itagui', label: 'Itagüí' },
            { value: 'medellin', label: 'Medellín' },
            { value: 'otro', label: 'Otro' },
          ].map((municipio) => (
            <button
              key={municipio.value}
              type="button"
              onClick={() => {
                updateData({ municipio: municipio.value });
                if (municipio.value !== 'otro') {
                  updateData({ municipioOtro: '' });
                }
              }}
              className={`
                px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200
                ${data.municipio === municipio.value 
                  ? 'bg-black text-white border-black' 
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
                }
              `}
            >
              {municipio.label}
            </button>
          ))}
        </div>
        
        {/* Campo de texto para "Otro" */}
        {data.municipio === 'otro' && (
          <div className="mt-3">
            <input
              type="text"
              value={data.municipioOtro}
              onChange={(e) => updateData({ municipioOtro: e.target.value })}
              placeholder="¿Cuál municipio?"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors text-base"
              style={{ fontSize: '16px' }}
            />
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                💬 Te daremos la cotización a través de correo en minutos una vez envíes los datos
              </p>
            </div>
          </div>
        )}
        
      </div>
        </>
      )}

      {/* Flight Number */}
      {isAirportTransfer && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Plane className="w-4 h-4" />
            {t('flightNumber')}
          </label>
          <input
            type="text"
            value={data.flightNumber}
            onChange={(e) => updateData({ flightNumber: e.target.value.toUpperCase() })}
            placeholder={t('flightNumberPlaceholder')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
            style={{ fontSize: '16px' }}
          />
        </div>
      )}

      {/* Date and Time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Calendar className="w-4 h-4" />
            {t('date')}
          </label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => updateData({ date: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
            style={{ fontSize: '16px' }}
            required
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            {t('time')}
          </label>
          <div className="flex gap-2">
            {/* Mobile: Time picker (native) */}
          <input
            type="time"
              value={data.time ? convert12to24(
                parseInt(data.time.split(':')[0]) || 12,
                parseInt(data.time.split(':')[1]) || 0,
                data.timePeriod || 'PM'
              ) : ''}
              onChange={handleTimeChange}
              placeholder="12:30"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors md:hidden text-base min-h-[48px]"
              style={{ fontSize: '16px' }}
              required
            />
            {/* Desktop: Manual input (1-12 format) */}
            <input
              type="text"
            value={data.time}
              onChange={handleTimeInput}
              placeholder="12:30"
              pattern="^(1[0-2]|[1-9]):[0-5][0-9]$"
              className="hidden md:flex flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
              style={{ fontSize: '16px' }}
            required
          />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => updateData({ timePeriod: 'AM' })}
                className={`px-3 sm:px-4 py-3 rounded-2xl font-medium transition-colors min-h-[48px] flex-shrink-0 ${
                  data.timePeriod === 'AM'
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => updateData({ timePeriod: 'PM' })}
                className={`px-3 sm:px-4 py-3 rounded-2xl font-medium transition-colors min-h-[48px] flex-shrink-0 ${
                  data.timePeriod === 'PM'
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Users className="w-4 h-4" />
          {t('passengers')}
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={passengerInput !== '' ? passengerInput : (data.passengers > 0 ? data.passengers.toString() : '')}
          onChange={(e) => {
            const value = e.target.value;
            // Permitir escribir cualquier número o campo vacío
            if (value === '') {
              setPassengerInput('');
              updateData({ passengers: 0 });
            } else if (/^\d+$/.test(value)) {
              // Solo permitir números
              setPassengerInput(value);
              const numValue = parseInt(value);
              const { max: maxPassengers } = getMinMaxPassengers();
              // Actualizar el estado real siempre que sea un número válido
              if (!isNaN(numValue)) {
                if (numValue > maxPassengers) {
                  // Si excede el máximo disponible, limitar al máximo
                  setPassengerInput(maxPassengers.toString());
                  updateData({ passengers: maxPassengers });
                } else if (numValue >= 1) {
                  // Permitir cualquier número válido
                  updateData({ passengers: numValue });
                }
              }
            }
          }}
          onBlur={(e) => {
            // Marcar como no enfocado antes de validar
            setIsPassengerInputFocused(false);
            const value = e.target.value;
            if (value === '') {
              setPassengerInput('');
              updateData({ passengers: 0 });
            } else {
              const numValue = parseInt(value);
              if (!isNaN(numValue)) {
                const { min: minPassengers, max: maxPassengers } = getMinMaxPassengers();
                if (numValue < minPassengers) {
                  // Si es menor al mínimo, ajustar al mínimo
                  setPassengerInput(minPassengers.toString());
                  updateData({ passengers: minPassengers });
                } else if (numValue > maxPassengers) {
                  setPassengerInput(maxPassengers.toString());
                  updateData({ passengers: maxPassengers });
                } else {
                  setPassengerInput(numValue.toString());
                  updateData({ passengers: numValue });
                }
              } else {
                setPassengerInput('');
                updateData({ passengers: 0 });
              }
            }
          }}
          onFocus={(e) => {
            // Cuando se enfoca, mostrar el valor actual en el input y marcar como enfocado
            setIsPassengerInputFocused(true);
            setPassengerInput(data.passengers > 0 ? data.passengers.toString() : '');
          }}
          placeholder="Número de pasajeros"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
          style={{ fontSize: '16px' }}
          required
        />
        {(() => {
          const ranges = getVehicleRangesForService();
          const { min, max } = getMinMaxPassengers();
          
          if (ranges.length === 0 && !pricingLoading) {
            return (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 my-4">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ No hay vehículos configurados para este servicio. Por favor configura los vehículos en el panel de administración.
                </p>
              </div>
            );
          }
          
          return (
            <p className="text-xs text-gray-500 mt-1">
              {ranges.length > 0 
                ? `Capacidad disponible: ${min} - ${max} personas`
                : 'Mínimo 1 pasajero'}
            </p>
          );
        })()}

        {/* Message if passengers count doesn't match any vehicle */}
        {data.passengers > 0 && !isValidPassengerCount(data.passengers) && !pricingLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 my-4">
            <p className="text-sm text-red-800 text-center font-medium">
              ⚠️ No se puede atender este número de personas para este servicio. 
        {(() => {
                const ranges = getVehicleRangesForService();
                if (ranges.length > 0) {
                  const rangesText = ranges.map(r => `${r.min}-${r.max}`).join(', ');
                  return ` Capacidades disponibles: ${rangesText} personas.`;
                }
                return '';
              })()}
            </p>
          </div>
        )}

        {/* Vehicle Image - Show only if vehicle is available for passengers */}
        {getCurrentVehicle() && isValidPassengerCount(data.passengers) && (
          <AnimatePresence mode="wait">
            <motion.div
              key={getCurrentVehicle()?.image}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center my-8"
            >
              <div className="relative w-full max-w-lg h-72 sm:h-80 md:h-96">
                <Image
                  src={getCurrentVehicle()!.image}
                  alt="Vehículo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 512px, 576px"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    (e.target as HTMLImageElement).src = '/auto-removebg-preview.png';
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Vehicle Price and Selection - Show only if vehicle is available for passengers */}
        {getCurrentVehicle() && isValidPassengerCount(data.passengers) && (
          <div className="space-y-4">
            {/* Vehicle Price */}
            {(() => {
              const currentVehicle = getCurrentVehicle();
              return currentVehicle && currentVehicle.price > 0 ? (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-700 block">
                        {currentVehicle.vehiculoNombre || currentVehicle.label}
                      </span>
                      <span className="text-xs text-gray-500">
                        {currentVehicle.min} - {currentVehicle.max} personas
                      </span>
                    </div>
                    <span className="text-lg font-bold text-black">
                      +{formatPrice(currentVehicle.price)} COP
                    </span>
                  </div>
                </div>
              ) : null;
            })()}
            
            <p className="text-sm text-gray-700 text-center">
              {t('vehicleSelection')}
            </p>
            
            {getUpgradeOptions().length > 0 && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  {t('upgradeVehicle')}
                </label>
                <div className="relative">
                  <select
                    value={data.selectedVehicle || ''}
                    onChange={(e) => {
                      const vehicle = getVehicleForPassengers(data.passengers);
                      updateData({ 
                        selectedVehicle: e.target.value, 
                        vehicleImage: e.target.value || (vehicle?.image || '')
                      });
                    }}
                    className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] appearance-none bg-white cursor-pointer hover:border-gray-300"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="">{t('keepSelectedVehicle')}</option>
                    {getUpgradeOptions().map((vehicle) => {
                      // Use the price from the vehicle object (from database)
                      const upgradePrice = vehicle.price || 0;
                      const vehicleLabel = vehicle.vehiculoNombre 
                        ? `${vehicle.vehiculoNombre} (${vehicle.min} - ${vehicle.max} personas)`
                        : vehicle.label;
                      return (
                        <option key={vehicle.image} value={vehicle.image}>
                          {vehicleLabel} {upgradePrice > 0 ? `(+${formatPrice(upgradePrice)} COP)` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guatapé Tour Additional Fields */}
      {serviceId === 'guatape-tour' && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold">{t('additionalServices')}</h4>
          
          {/* Boat Ride Selector */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-3">
              {t('boatRide')}
            </label>
            <div className="relative">
              <select
                value={data.boatRide || ''}
                onChange={(e) => updateData({ boatRide: e.target.value })}
                className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] appearance-none bg-white cursor-pointer hover:border-gray-300"
                style={{ fontSize: '16px' }}
              >
                <option value="">{t('noBoatRide')}</option>
                <option value="1-6">{t('boatRide16')}</option>
                <option value="1-15">{t('boatRide115')}</option>
                <option value="1-22">{t('boatRide122')}</option>
                <option value="1-30">{t('boatRide130')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {data.boatRide && getBoatRidePrice(data.boatRide) > 0 && (
              <p className="text-sm font-medium text-gray-700 mt-2">
                +{formatPrice(getBoatRidePrice(data.boatRide))} COP
              </p>
            )}
          </div>

          {/* Lunch Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              {t('lunchCount')}
            </label>
            <input
              type="number"
              min="0"
              value={data.lunchCount || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0)) {
                  updateData({ lunchCount: value });
                }
              }}
              placeholder={t('lunchCountPlaceholder')}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
              style={{ fontSize: '16px' }}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">{t('lunchPrice')}</p>
              {data.lunchCount && parseInt(data.lunchCount) > 0 && (
                <p className="text-sm font-medium text-gray-700">
                  +{formatPrice(getLunchPricePerPerson() * parseInt(data.lunchCount))} COP
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ATV Tour Additional Fields */}
      {serviceId === 'atv-tour' && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold">{t('additionalServices')}</h4>
          
          {/* ATV Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              Cantidad de motos ATV (1-12)
            </label>
            <input
              type="number"
              min="0"
              max="12"
              value={data.atvCount || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 12)) {
                  updateData({ atvCount: value });
                }
              }}
              placeholder="Número de motos (1-12)"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
              style={{ fontSize: '16px' }}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">Valor por moto: {formatPrice(getAtvPrice())} COP</p>
              {data.atvCount && parseInt(data.atvCount) > 0 && (
                <p className="text-sm font-medium text-gray-700">
                  +{formatPrice(getAtvPrice() * parseInt(data.atvCount))} COP
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Parapente Tour Additional Fields */}
      {serviceId === 'parapente-tour' && (
        <div className="space-y-6 pt-4 border-t border-gray-200">
          <h4 className="text-lg font-semibold">{t('additionalServices')}</h4>
          
          {/* Parapente Count */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              Cantidad de personas que participarán (ingresos a la atracción)
            </label>
            <input
              type="number"
              min="0"
              value={data.parapenteCount || ''}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || (parseInt(value) >= 0)) {
                  updateData({ parapenteCount: value });
                }
              }}
              placeholder="Número de personas"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
              style={{ fontSize: '16px' }}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">Valor por persona: {formatPrice(getParapentePrice())} COP</p>
              {data.parapenteCount && parseInt(data.parapenteCount) > 0 && (
                <p className="text-sm font-medium text-gray-700">
                  +{formatPrice(getParapentePrice() * parseInt(data.parapenteCount))} COP
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Fields - Only show for non-airport-transfer services */}
      {customFields.length > 0 && !isAirportTransfer && (
        <div className="space-y-4 pt-6 border-t-2 border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Servicios Adicionales</h4>
          {customFields.map((field, index) => {
            const fieldKey = `custom_${index}_${field.label}`;
            const fieldValue = customFieldValues[fieldKey] || '';
            const cantidad = parseInt(fieldValue) || 0;
            const precioTotal = field.necesitaValor && field.precioPorPersona 
              ? cantidad * field.precioPorPersona 
              : 0;

            return (
              <div key={index} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.necesitaValor && field.precioPorPersona && (
                    <span className="text-xs text-gray-500 ml-2">
                      (${formatPrice(field.precioPorPersona)} por persona)
                    </span>
                  )}
                </label>
                
                {field.type === 'number' ? (
                  <div>
                    <input
                      type="number"
                      min="0"
                      value={fieldValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        const newCustomFieldValues = { ...customFieldValues, [fieldKey]: value };
                        setCustomFieldValues(newCustomFieldValues);
                        
                        // Store custom field values in data for submission
                        updateData({ 
                          customFields: newCustomFieldValues 
                        } as any);
                        
                        // Recalculate total price
                        const newTotal = calculateTotalPrice();
                        updateData({ totalPrice: newTotal });
                      }}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
                      style={{ fontSize: '16px' }}
                    />
                    {field.necesitaValor && field.precioPorPersona && cantidad > 0 && (
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">
                          {cantidad} {cantidad === 1 ? 'persona' : 'personas'} × ${formatPrice(field.precioPorPersona)}
                        </p>
                        <p className="text-sm font-medium text-gray-700">
                          +{formatPrice(precioTotal)} COP
                        </p>
                      </div>
                    )}
                  </div>
                ) : field.type === 'text' ? (
                  <input
                    type="text"
                    value={fieldValue}
                    onChange={(e) => setCustomFieldValues({ ...customFieldValues, [fieldKey]: e.target.value })}
                    placeholder={`Ingresa ${field.label.toLowerCase()}`}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
                    style={{ fontSize: '16px' }}
                  />
                ) : field.type === 'textarea' ? (
                  <textarea
                    value={fieldValue}
                    onChange={(e) => setCustomFieldValues({ ...customFieldValues, [fieldKey]: e.target.value })}
                    placeholder={`Ingresa ${field.label.toLowerCase()}`}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base"
                  />
                ) : field.type === 'checkbox' ? (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fieldValue === 'true'}
                      onChange={(e) => setCustomFieldValues({ ...customFieldValues, [fieldKey]: e.target.checked.toString() })}
                      className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                    />
                    <span className="text-sm text-gray-700">Sí</span>
                  </label>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-3 text-black hover:bg-gray-100 rounded-2xl font-medium transition-colors min-h-[44px] border-2 border-gray-200"
          >
            <ChevronLeft className="w-5 h-5" />
            {t('back')}
          </button>
        )}
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
        >
          {t('next')}
        </button>
      </div>
    </motion.form>
  );
}

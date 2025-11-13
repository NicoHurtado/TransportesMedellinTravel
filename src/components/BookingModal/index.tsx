'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHotel } from '@/contexts/HotelContext';
import { useReservation } from '@/hooks/useReservation';
import { usePricingData } from '@/hooks/usePricingData';
import StepIndicator from './StepIndicator';
import ServiceInfo from './ServiceInfo';
import TripDetails from './TripDetails';
import ContactInfo from './ContactInfo';
import NotesRecommendations from './NotesRecommendations';
import Summary from './Summary';
import Confirmation from './Confirmation';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
  serviceDescription?: string;
}

export interface BookingData {
  // Trip details
  from: string;
  to: string;
  municipio: string;
  municipioOtro: string;
  date: string;
  time: string;
  timePeriod: 'AM' | 'PM';
  passengers: number;
  vehicleImage: string;
  selectedVehicle?: string; // Selected vehicle option (optional upgrade)
  flightNumber: string;
  hoursNeeded: string; // For custom transport
  
  // Tour language preference
  tourLanguage?: 'spanish' | 'english'; // Preferred language for the tour
  wantsGuide?: boolean; // Wants certified guide
  
  // Pricing
  basePrice?: number; // Base price for the service
  vehiclePrice?: number; // Selected vehicle price
  additionalServicesPrice?: number; // Total price for additional services
  totalPrice?: number; // Total calculated price (before hotel commission)
  hotelCommission?: number; // Hotel commission amount
  finalPrice?: number; // Final price after hotel commission deduction
  
  // Guatapé Tour specific fields
  boatRide?: string; // '1-6' | '1-15' | '1-22' | '1-30' | ''
  lunchCount?: string; // Number of lunches
  privateTransport?: boolean; // Private transport (default true)
  altoDelChocho?: boolean; // Alto del Chocho stop
  replicaViejoPenol?: boolean; // Replica del Viejo Peñol
  casaAlReves?: boolean; // Casa al Revés
  piedraGuatape?: boolean; // Piedra de Guatapé
  plazaPrincipal?: boolean; // Plaza Principal
  calleSombrillas?: boolean; // Calle de las Sombrillas
  calleZocalos?: boolean; // Calle de los Zócalos
  malecon?: boolean; // Malecón
  medicalAssistance?: boolean; // Medical assistance card
  driverAccompaniment?: boolean; // Driver and vehicle accompaniment
  
  // ATV Tour specific fields
  atvCount?: string; // Number of ATV motorcycles (1-12)
  
  // Parapente Tour specific fields
  parapenteCount?: string; // Number of people participating in paragliding (entries)
  
  // Contact
  name: string;
  whatsapp: string;
  email: string;
  
  // Attending persons
  attendingPersons?: Array<{
    name: string;
    identificationNumber: string;
    identificationType: 'cedula' | 'passport';
  }>;
  
  // Notes
  additionalNotes: string;
  recommendations: string[];
}

export default function BookingModal({ isOpen, onClose, serviceId, serviceName, serviceImage, serviceDescription }: BookingModalProps) {
  const { t, language } = useLanguage();
  const { isHotel, hotelName, hotelId, hotelCommission, getComisionEspecifica } = useHotel();
  const { createReservation, loading: submitting } = useReservation();
  const { getPrecioAdicional, preciosVehiculos } = usePricingData(serviceId);
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [trackingCode, setTrackingCode] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollableContentRef = useRef<HTMLDivElement>(null);
  
  const [bookingData, setBookingData] = useState<BookingData>({
    from: '',
    to: '',
    municipio: '',
    municipioOtro: '',
    date: '',
    time: '',
    timePeriod: 'AM',
    passengers: 0,
    vehicleImage: '',
    selectedVehicle: '',
    flightNumber: '',
    hoursNeeded: '',
    tourLanguage: 'spanish',
    wantsGuide: false,
    basePrice: 0,
    vehiclePrice: 0,
    additionalServicesPrice: 0,
    totalPrice: 0,
    hotelCommission: 0,
    finalPrice: 0,
    boatRide: '',
    lunchCount: '',
    privateTransport: true,
    altoDelChocho: true,
    replicaViejoPenol: true,
    casaAlReves: true,
    piedraGuatape: true,
    plazaPrincipal: true,
    calleSombrillas: true,
    calleZocalos: true,
    malecon: true,
    medicalAssistance: true,
    driverAccompaniment: true,
    atvCount: '',
    parapenteCount: '',
    name: '',
    whatsapp: '',
    email: '',
    attendingPersons: [{
      name: '',
      identificationNumber: '',
      identificationType: 'cedula',
    }],
    additionalNotes: '',
    recommendations: [],
  });

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Auto-fill destination for tours when modal opens
  useEffect(() => {
    if (isOpen && serviceId.includes('-tour')) {
      const tourNames: { [key: string]: string } = {
        'guatape-tour': t('guatapeTour'),
        'graffiti-tour': t('graffitiTour'),
        'city-tour': t('cityTour'),
        'hacienda-napoles-tour': t('haciendaNapolesTour'),
        'occidente-tour': t('occidenteTour'),
        'parapente-tour': t('parapenteTour'),
        'atv-tour': t('atvTour'),
        'jardin-tour': t('jardinTour'),
        'coffee-farm-tour': t('coffeeFarmTour'),
      };
      const tourName = tourNames[serviceId] || serviceName;
      setBookingData(prev => ({
        ...prev,
        to: tourName
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, serviceId]);

  // Reset Guatapé tour fields when service changes (only on modal open or step 0)
  useEffect(() => {
    if (isOpen && currentStep === 0) {
      if (serviceId === 'guatape-tour') {
        // Initialize Guatapé tour fields if not already set
        setBookingData(prev => ({
          ...prev,
          privateTransport: prev.privateTransport ?? true,
          altoDelChocho: prev.altoDelChocho ?? true,
          replicaViejoPenol: prev.replicaViejoPenol ?? true,
          casaAlReves: prev.casaAlReves ?? true,
          piedraGuatape: prev.piedraGuatape ?? true,
          plazaPrincipal: prev.plazaPrincipal ?? true,
          calleSombrillas: prev.calleSombrillas ?? true,
          calleZocalos: prev.calleZocalos ?? true,
          malecon: prev.malecon ?? true,
          medicalAssistance: prev.medicalAssistance ?? true,
          driverAccompaniment: prev.driverAccompaniment ?? true,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, serviceId, currentStep]);

  // Scroll to top when step changes or confirmation is shown
  useEffect(() => {
    if (isOpen && scrollableContentRef.current) {
      // Small delay to ensure content is rendered before scrolling
      const timeoutId = setTimeout(() => {
        if (scrollableContentRef.current) {
          scrollableContentRef.current.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentStep, isOpen, isConfirmed]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleConfirm = async () => {
    setSubmitError(null);
    
    // Marcar que estamos creando la reserva para evitar duplicados
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('reservationCreating', 'true');
    }
    
    try {
      // Map serviceId to API endpoint
      const serviceIdMap: { [key: string]: string } = {
        'airport-transfer': 'airport-transfer',
        'custom-transport': 'custom-transport',
        'guatape-tour': 'guatape-tour',
        'city-tour': 'city-tour',
        'graffiti-tour': 'graffiti-tour',
        'hacienda-napoles-tour': 'hacienda-napoles-tour',
        'occidente-tour': 'occidente-tour',
        'parapente-tour': 'parapente-tour',
        'atv-tour': 'atv-tour',
        'jardin-tour': 'jardin-tour',
        'coffee-farm-tour': 'coffee-farm-tour',
      };
      
      const apiServiceId = serviceIdMap[serviceId] || serviceId;
      
      // Obtener vehiculoId del vehículo seleccionado basándome en el número de pasajeros
      let vehiculoIdSeleccionado: number | null = null;
      if (bookingData.passengers > 0 && preciosVehiculos.length > 0) {
        const precioVehiculo = preciosVehiculos.find(
          (p) => bookingData.passengers >= p.pasajerosMin && bookingData.passengers <= p.pasajerosMax && p.activo
        );
        if (precioVehiculo) {
          vehiculoIdSeleccionado = precioVehiculo.vehiculoId;
        }
      }
      
      // Calcular comisión específica del hotel si está en modo hotel y hay vehiculoId
      let calculatedCommission = 0;
      if (isHotel && hotelId && vehiculoIdSeleccionado && bookingData.totalPrice) {
        const comisionEspecifica = getComisionEspecifica(apiServiceId, vehiculoIdSeleccionado);
        if (comisionEspecifica > 0) {
          // Si hay comisión específica, usar esa cantidad fija
          calculatedCommission = comisionEspecifica;
        } else {
          // Si no hay comisión específica, usar el porcentaje como fallback
          calculatedCommission = (bookingData.totalPrice * hotelCommission) / 100;
        }
      }
      
      const calculatedFinalPrice = isHotel && bookingData.totalPrice 
        ? bookingData.totalPrice - calculatedCommission
        : bookingData.totalPrice || 0;
      
      // Debug: Log pricing values
      console.log('======= PRECIOS EN FRONTEND =======');
      console.log('totalPrice:', bookingData.totalPrice);
      console.log('isHotel:', isHotel);
      console.log('hotelCommission:', hotelCommission);
      console.log('calculatedCommission:', calculatedCommission);
      console.log('calculatedFinalPrice:', calculatedFinalPrice);
      console.log('==================================');
      
      // Prepare reservation data based on service type
      const reservationData: any = {
        hotelId,
        fecha: bookingData.date,
        hora: bookingData.time,
        numeroPasajeros: bookingData.passengers,
        nombreContacto: bookingData.name,
        telefonoContacto: bookingData.whatsapp,
        emailContacto: bookingData.email,
        personasAsistentes: bookingData.attendingPersons || [],
        peticionesEspeciales: bookingData.additionalNotes || null,
        language, // Idioma seleccionado en la página
        
        // Pricing
        precioBase: bookingData.basePrice || 0,
        precioVehiculo: bookingData.vehiclePrice || 0,
        precioTotal: bookingData.totalPrice || 0,
        comisionHotel: calculatedCommission,
        precioFinal: calculatedFinalPrice,
        
        // Vehicle
        vehiculoId: vehiculoIdSeleccionado || null,
      };
      
      // Service-specific fields
      if (serviceId === 'airport-transfer') {
        reservationData.direccion = bookingData.to ? 'to' : 'from';
        reservationData.aeropuerto = 'MDE'; // You might want to detect this
        reservationData.numeroVuelo = bookingData.flightNumber || null;
        reservationData.origen = bookingData.from;
        reservationData.destino = bookingData.to;
        reservationData.municipio = bookingData.municipio === 'otro' ? bookingData.municipioOtro : bookingData.municipio;
      } else {
        // Tour services
        reservationData.lugarRecogida = bookingData.from;
        reservationData.municipio = bookingData.municipio === 'otro' ? bookingData.municipioOtro : bookingData.municipio;
        reservationData.idiomaTour = bookingData.tourLanguage || 'spanish';
        reservationData.quiereGuia = bookingData.wantsGuide || false;
        reservationData.precioGuia = bookingData.wantsGuide 
          ? getPrecioAdicional(bookingData.tourLanguage === 'english' ? 'guia_ingles' : 'guia_espanol')
          : 0;
        
        // Guatapé specific
        if (serviceId === 'guatape-tour') {
          reservationData.paseoBote = bookingData.boatRide || null;
          reservationData.precioBote = bookingData.boatRide ? getPrecioAdicional('bote', bookingData.boatRide) : 0;
          reservationData.cantidadAlmuerzos = parseInt(bookingData.lunchCount || '0');
          reservationData.precioAlmuerzos = parseInt(bookingData.lunchCount || '0') * getPrecioAdicional('almuerzo');
          reservationData.precioServiciosAdicionales = 
            reservationData.precioBote + 
            reservationData.precioAlmuerzos + 
            reservationData.precioGuia;
        }
        
        // ATV specific
        if (serviceId === 'atv-tour') {
          reservationData.cantidadMotos = parseInt(bookingData.atvCount || '0');
          reservationData.precioMotos = parseInt(bookingData.atvCount || '0') * 300000;
        }
        
        // Parapente specific
        if (serviceId === 'parapente-tour') {
          reservationData.cantidadParticipantes = parseInt(bookingData.parapenteCount || '0');
          reservationData.precioParticipantes = parseInt(bookingData.parapenteCount || '0') * 250000;
        }
      }
      
      // Verificar si ya existe una reserva antes de crear otra (protección adicional)
      // PERO: Para hoteles, permitir crear la reserva normalmente ya que el flujo es diferente
      const existingReservation = typeof window !== 'undefined' 
        ? (sessionStorage.getItem('lastReservationCode') || localStorage.getItem('lastReservationCode'))
        : null;
      
      if (existingReservation && !isHotel) {
        console.warn('⚠️ Ya existe una reserva creada. No se creará duplicado.');
        console.warn('📝 Código de reserva existente:', existingReservation);
        // Retornar sin crear otra reserva (solo para usuarios normales)
        return;
      }
      
      // Para hoteles, limpiar el código de reserva previo si existe para permitir crear una nueva
      if (existingReservation && isHotel) {
        console.log('🏨 Es hotel, limpiando reserva previa para permitir crear nueva reserva');
        if (typeof window !== 'undefined') {
          sessionStorage.removeItem('lastReservationCode');
          localStorage.removeItem('lastReservationCode');
        }
      }
      
      // Submit to API
      const result = await createReservation(apiServiceId, reservationData);
      
      if (result.success && result.trackingUrl) {
        const codigoReserva = result.data.codigoReserva;
        
        // Guardar codigoReserva en sessionStorage Y localStorage para poder enviar email de pago después
        if (typeof window !== 'undefined' && codigoReserva) {
          sessionStorage.setItem('lastReservationCode', codigoReserva);
          localStorage.setItem('lastReservationCode', codigoReserva);
          
          // También guardar el mapeo con el boldOrderId si existe
          const boldOrderId = sessionStorage.getItem('boldOrderId') || localStorage.getItem('boldOrderId');
          const pendingBoldOrderId = sessionStorage.getItem('pendingBoldOrderId') || localStorage.getItem('pendingBoldOrderId');
          
          // Usar el boldOrderId actual o el pendingBoldOrderId
          const orderIdToMap = boldOrderId || pendingBoldOrderId;
          
          if (orderIdToMap) {
            sessionStorage.setItem(`boldOrderId_${orderIdToMap}`, codigoReserva);
            localStorage.setItem(`boldOrderId_${orderIdToMap}`, codigoReserva);
            console.log('💾 Mapeo boldOrderId -> codigoReserva guardado:', {
              boldOrderId: orderIdToMap,
              codigoReserva
            });
            
            // Limpiar el pendingBoldOrderId ya que ya creamos el mapeo
            if (pendingBoldOrderId) {
              sessionStorage.removeItem('pendingBoldOrderId');
              localStorage.removeItem('pendingBoldOrderId');
            }
          }
          
          console.log('💾 Guardado codigoReserva en sessionStorage y localStorage:', codigoReserva);
        }
        
        // Si NO es hotel y hay botón de Bold, NO mostrar el modal de confirmación
        // Solo mostrar el modal si es hotel o si no hay botón de Bold
        const hasBoldButton = !isHotel && (sessionStorage.getItem('boldOrderId') || localStorage.getItem('boldOrderId'));
        
        if (!hasBoldButton) {
          // Solo mostrar confirmación si NO hay botón de Bold (hotel o sin pago)
          setTrackingCode(codigoReserva);
          setIsConfirmed(true);
          
          // Si es hotel, cerrar el modal después de mostrar confirmación y quedarse en la página
          if (isHotel) {
            setTimeout(() => {
              setIsConfirmed(false);
              onClose(); // Cerrar el modal
              // Disparar evento personalizado para refrescar las reservas del hotel
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('hotelReservationCreated'));
              }
            }, 2000);
          } else {
            // Para usuarios normales, redirigir a tracking page
            setTimeout(() => {
              // result.trackingUrl ya viene como ruta relativa desde el API
              // Construir URL completa usando el helper
              if (typeof window !== 'undefined') {
                const { buildUrl } = require('@/lib/url');
                window.location.href = buildUrl(result.trackingUrl!);
              }
            }, 3000);
          }
        } else {
          // Si hay botón de Bold, la reserva ya está creada y el usuario puede pagar
          // No mostrar el modal de confirmación, dejar que el usuario vea el botón de Bold
          // IMPORTANTE: NO crear otra reserva, solo guardar el codigoReserva para actualizar después
          console.log('✅ Reserva creada con estado "agendada_con_cotizacion". El usuario puede proceder con el pago.');
          console.log('📝 Código de reserva:', codigoReserva);
        }
      }
    } catch (error: any) {
      console.error('Error creating reservation:', error);
      setSubmitError(error.message || 'Error al crear la reserva. Por favor, intenta nuevamente.');
    } finally {
      // Limpiar el flag de creación de reserva
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('reservationCreating');
      }
    }
  };
  
  // Helper function for boat prices
  const getPrecioBot = (rango: string): number => {
    const precios: { [key: string]: number } = {
      '1-6': 230000,
      '1-15': 250000,
      '1-22': 300000,
      '1-30': 400000,
    };
    return precios[rango] || 0;
  };

  const handleClose = () => {
    setCurrentStep(0);
    setIsConfirmed(false);
    setBookingData({
      from: '',
      to: '',
      municipio: '',
      municipioOtro: '',
      date: '',
      time: '',
      timePeriod: 'AM',
      passengers: 0,
      vehicleImage: '',
      selectedVehicle: '',
      flightNumber: '',
      hoursNeeded: '',
      tourLanguage: 'spanish',
      boatRide: '',
      lunchCount: '',
      atvCount: '',
      privateTransport: true,
      altoDelChocho: true,
      replicaViejoPenol: true,
      casaAlReves: true,
      piedraGuatape: true,
      plazaPrincipal: true,
      calleSombrillas: true,
      calleZocalos: true,
      malecon: true,
      medicalAssistance: true,
      driverAccompaniment: true,
      name: '',
      whatsapp: '',
      email: '',
      attendingPersons: [{
        name: '',
        identificationNumber: '',
        identificationType: 'cedula',
      }],
      additionalNotes: '',
      recommendations: [],
    });
    onClose();
  };

  // Prevent body scroll when modal is open (iOS fix)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed height */}
              <div className="flex-shrink-0 bg-white border-b border-gray-100 rounded-t-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-h-[56px]">
                  {/* Service thumbnail */}
                  <div className="relative w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {serviceImage.startsWith('/') ? (
                      <Image 
                        src={serviceImage} 
                        alt={serviceName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="text-2xl">{serviceImage}</span>
                    )}
                  </div>
                    <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold truncate">{serviceName}</h2>
                    <div className="h-5">
                      {!isConfirmed && <StepIndicator currentStep={currentStep} totalSteps={5} />}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors ml-4 flex-shrink-0"
                  aria-label={t('close')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div 
                ref={scrollableContentRef}
                className="flex-1 overflow-y-auto p-6 sm:p-8"
              >
                {!isConfirmed ? (
                  <AnimatePresence mode="wait">
                    {currentStep === 0 && serviceDescription && (
                      <ServiceInfo
                        serviceId={serviceId}
                        serviceDescription={serviceDescription}
                        onNext={handleNext}
                      />
                    )}
                    {currentStep === 1 && (
                      <TripDetails
                        data={bookingData}
                        updateData={updateBookingData}
                        onNext={handleNext}
                        onBack={serviceDescription ? handleBack : undefined}
                        serviceId={serviceId}
                        serviceName={serviceName}
                      />
                    )}
                    {currentStep === 2 && (
                      <ContactInfo
                        data={bookingData}
                        updateData={updateBookingData}
                        onNext={handleNext}
                        onBack={handleBack}
                      />
                    )}
                    {currentStep === 3 && (
                      <NotesRecommendations
                        data={bookingData}
                        updateData={updateBookingData}
                        onNext={handleNext}
                        onBack={handleBack}
                      />
                    )}
                    {currentStep === 4 && (
                      <>
                        {submitError && (
                          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                            <p className="font-semibold">Error al procesar la reserva</p>
                            <p className="text-sm mt-1">{submitError}</p>
                          </div>
                        )}
                        <Summary
                          data={bookingData}
                          serviceName={serviceName}
                          serviceImage={serviceImage}
                          serviceId={serviceId}
                          onConfirm={handleConfirm}
                          onBack={handleBack}
                          isSubmitting={submitting}
                        />
                      </>
                    )}
                  </AnimatePresence>
                ) : (
                  <Confirmation trackingId={trackingCode} onClose={handleClose} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


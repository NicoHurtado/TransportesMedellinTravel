'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHotel } from '@/contexts/HotelContext';
import ServiceCard from '@/components/ServiceCard';
import BookingModal from '@/components/BookingModal';

interface Service {
  id: number;
  codigo: string;
  nombreEs: string;
  nombreEn: string;
  descripcionCortaEs: string | null;
  descripcionCortaEn: string | null;
  descripcionCompletaEs: string | null;
  descripcionCompletaEn: string | null;
  imagenUrl: string | null;
  activo: boolean;
}

interface HotelReservation {
  id: number;
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  numeroPasajeros: number;
  nombreContacto: string;
  precioFinal: number;
  estado: string;
  createdAt: string;
}

export default function ReservasPage() {
  const { t, language } = useLanguage();
  const { isHotel, hotelId } = useHotel();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [hotelReservations, setHotelReservations] = useState<HotelReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [contextReady, setContextReady] = useState(false);

  // Esperar a que el contexto del hotel se inicialice completamente
  useEffect(() => {
    // Si no es hotel, el contexto está listo inmediatamente
    if (!isHotel) {
      setContextReady(true);
      return;
    }
    
    // Si es hotel, esperar a que hotelId esté disponible
    // Esto asegura que el contexto se haya cargado desde localStorage
    if (isHotel && hotelId && typeof hotelId === 'number') {
      console.log('✅ Contexto del hotel listo:', { hotelId });
      setContextReady(true);
    } else {
      console.log('⏳ Esperando contexto del hotel...', { isHotel, hotelId });
      setContextReady(false);
    }
  }, [isHotel, hotelId]);

  // Interceptor para redirigir cuando Bold regresa del pago
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const boldOrderId = urlParams.get('bold-order-id');
      const boldTxStatus = urlParams.get('bold-tx-status');
      
      if (boldOrderId && boldTxStatus) {
        console.log('🔄 Redirigiendo a página de resultado de pago...', {
          boldOrderId,
          boldTxStatus
        });
        
        // Redirigir a la página de resultado con los parámetros
        const redirectUrl = `/pagos/resultado?bold-order-id=${boldOrderId}&bold-tx-status=${boldTxStatus}`;
        window.location.href = redirectUrl;
        return; // No continuar con el resto del código si estamos redirigiendo
      }
    }
  }, []);

  // Función para cargar las reservas del hotel
  const fetchHotelReservations = useCallback(async () => {
    if (!isHotel || !hotelId) return;
    
    try {
      setLoadingReservations(true);
      const response = await fetch(`/api/hoteles/${hotelId}/reservas`);
      const data = await response.json();
      
      if (data.success) {
        // Filtrar solo reservas activas (no canceladas ni completadas)
        const activeReservations = data.data.filter((r: HotelReservation) => 
          r.estado !== 'cancelada' && r.estado !== 'completada'
        );
        // Ordenar por fecha (más recientes primero) y limitar a las últimas 5
        activeReservations.sort((a: HotelReservation, b: HotelReservation) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHotelReservations(activeReservations.slice(0, 5));
      }
    } catch (error) {
      console.error('Error fetching hotel reservations:', error);
    } finally {
      setLoadingReservations(false);
    }
  }, [isHotel, hotelId]);

  useEffect(() => {
    // No cargar servicios hasta que el contexto esté listo
    if (!contextReady) {
      console.log('⏳ Esperando contexto antes de cargar servicios...');
      return;
    }

    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Si es hotel, filtrar servicios activos para ese hotel
        // Validar que hotelId sea un número válido antes de usarlo
        const url = isHotel && hotelId && typeof hotelId === 'number' && !isNaN(hotelId)
          ? `/api/services?hotelId=${hotelId}`
          : '/api/services';
        
        console.log('🔍 Fetching services:', { isHotel, hotelId, url, contextReady });
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Los servicios ya vienen filtrados por el backend cuando hay hotelId
          // Solo mostrar los servicios que vienen del backend (ya filtrados)
          const servicesToShow = data.data?.servicios || [];
          console.log(`✅ Servicios recibidos: ${servicesToShow.length}`, servicesToShow.map((s: Service) => s.codigo));
          setServices(servicesToShow);
        } else {
          console.error('❌ Error en respuesta de servicios:', data.error, data.details);
          // Si hay error pero no es crítico, intentar cargar sin filtro de hotel
          if (isHotel && hotelId) {
            console.log('🔄 Intentando cargar servicios sin filtro de hotel...');
            const fallbackResponse = await fetch('/api/services');
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.success) {
              setServices(fallbackData.data?.servicios || []);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching services:', error);
        // En caso de error, intentar cargar servicios sin filtro
        if (isHotel && hotelId) {
          try {
            console.log('🔄 Intentando cargar servicios sin filtro de hotel como fallback...');
            const fallbackResponse = await fetch('/api/services');
            const fallbackData = await fallbackResponse.json();
            if (fallbackData.success) {
              setServices(fallbackData.data?.servicios || []);
            }
          } catch (fallbackError) {
            console.error('❌ Error en fallback:', fallbackError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [isHotel, hotelId, contextReady]);

  // Cargar reservas del hotel cuando el contexto esté listo
  useEffect(() => {
    // Esperar a que el contexto se cargue completamente
    // Verificar que hotelId sea un número válido, no null
    if (isHotel && hotelId && typeof hotelId === 'number') {
      console.log('🏨 Cargando reservas del hotel:', hotelId);
      fetchHotelReservations();
    } else {
      console.log('⏳ Esperando contexto del hotel...', { isHotel, hotelId });
    }
  }, [isHotel, hotelId, fetchHotelReservations]);

  // Escuchar evento de nueva reserva creada para refrescar la lista
  useEffect(() => {
    if (!isHotel || !hotelId) return;
    
    const handleReservationCreated = () => {
      fetchHotelReservations();
    };
    
    window.addEventListener('hotelReservationCreated', handleReservationCreated);
    
    return () => {
      window.removeEventListener('hotelReservationCreated', handleReservationCreated);
    };
  }, [isHotel, hotelId, fetchHotelReservations]);

  const handleBook = (serviceId: string) => {
    const service = services.find(s => s.codigo === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section - Compact with Background Image */}
      <section className="relative h-[40vh] min-h-[350px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/heroimage.jpeg)',
            backgroundPosition: 'center 65%'
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t('ourServices')}
          </h1>
          <p className="text-base sm:text-lg text-gray-200 mb-8">
            {t('serviceDescription')}
          </p>
          
          {/* Book now button with arrow */}
          <button
            onClick={scrollToServices}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 min-h-[44px]"
          >
            {t('bookNow')}
            <svg 
              className="w-4 h-4 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 ${isHotel ? 'lg:flex lg:gap-8' : ''}`}>
        {/* Sidebar para hoteles */}
        {isHotel && (
          <aside className="lg:w-80 mb-8 lg:mb-0 lg:sticky lg:top-24 lg:h-fit">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Mis Servicios Activos</h2>
              
              {/* Lista de reservas activas */}
              {loadingReservations || (isHotel && hotelId === null) ? (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500">Cargando reservas...</p>
                </div>
              ) : hotelReservations.length > 0 ? (
                <div className="mb-4 space-y-3 max-h-[400px] overflow-y-auto">
                  {hotelReservations.map((reservation) => {
                    const estadoConfig: { [key: string]: { color: string; label: string } } = {
                      pendiente_por_cotizacion: { color: 'bg-orange-100 text-orange-800', label: 'Pendiente' },
                      agendada_con_cotizacion: { color: 'bg-blue-100 text-blue-800', label: 'Agendada' },
                      pagado: { color: 'bg-yellow-100 text-yellow-800', label: 'Pagado' },
                      asignada: { color: 'bg-purple-100 text-purple-800', label: 'Asignada' },
                      completada: { color: 'bg-green-100 text-green-800', label: 'Completada' },
                      cancelada: { color: 'bg-red-100 text-red-800', label: 'Cancelada' },
                    };
                    const estadoInfo = estadoConfig[reservation.estado] || { color: 'bg-gray-100 text-gray-800', label: reservation.estado };
                    
                    return (
                      <div
                        key={reservation.id}
                        className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors cursor-pointer"
                        onClick={() => {
                          window.location.href = `/tracking/${reservation.codigoReserva}`;
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {reservation.nombreServicio}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color} flex-shrink-0 ml-2`}>
                            {estadoInfo.label}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p className="font-mono text-gray-500">{reservation.codigoReserva}</p>
                          <p>
                            {new Date(reservation.fecha).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short'
                            })} • {reservation.hora}
                          </p>
                          <p>{reservation.numeroPasajeros} {reservation.numeroPasajeros === 1 ? 'pasajero' : 'pasajeros'}</p>
                          {reservation.precioFinal > 0 && (
                            <p className="font-semibold text-gray-900">
                              {new Intl.NumberFormat('es-CO', {
                                style: 'currency',
                                currency: 'COP',
                                minimumFractionDigits: 0,
                              }).format(reservation.precioFinal)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">No tienes reservas activas</p>
                  <p className="text-xs text-gray-400">Las reservas que hagas aparecerán aquí</p>
                </div>
              )}
              
              <button
                onClick={() => router.push('/hotel/servicios')}
                className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Ver todos mis servicios
              </button>
              <p className="text-xs text-gray-500 mt-4">
                Aquí puedes ver y gestionar todos los servicios que has reservado.
              </p>
            </div>
          </aside>
        )}

        <div className={isHotel ? 'flex-1' : ''}>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-600">Cargando servicios...</p>
            </div>
          ) : services.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <p className="text-gray-600">No hay servicios disponibles en este momento.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.codigo}
                  image={service.imagenUrl || '/medellin.jpg'}
                  titleKey={language === 'es' ? service.nombreEs : service.nombreEn}
                  descriptionKey={language === 'es' 
                    ? (service.descripcionCortaEs || service.descripcionCompletaEs || '')
                    : (service.descripcionCortaEn || service.descripcionCompletaEn || '')
                  }
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          serviceId={selectedService.codigo}
          serviceName={language === 'es' ? selectedService.nombreEs : selectedService.nombreEn}
          serviceImage={selectedService.imagenUrl || '/medellin.jpg'}
          serviceDescription={language === 'es' 
            ? (selectedService.descripcionCompletaEs || selectedService.descripcionCortaEs || '')
            : (selectedService.descripcionCompletaEn || selectedService.descripcionCortaEn || '')
          }
        />
      )}
    </>
  );
}


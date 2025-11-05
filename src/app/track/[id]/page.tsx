'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MapPin, Calendar, Clock, Users, User, Phone, Mail, Plane, 
  CheckCircle2, Clock as ClockIcon, XCircle, Truck, CheckCircle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface TrackingData {
  trackingId: string;
  serviceName: string;
  serviceImage: string;
  from: string;
  to: string;
  date: string;
  time: string;
  timePeriod: 'AM' | 'PM';
  passengers: number;
  vehicleImage: string;
  flightNumber?: string;
  name: string;
  whatsapp: string;
  email: string;
  status: 'pending' | 'confirmed' | 'assigned' | 'completed' | 'cancelled';
  driver?: string;
  vehicle?: string;
  quote?: number;
  createdAt: string;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    labelEn: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: ClockIcon,
    description: 'Tu solicitud está siendo revisada',
    descriptionEn: 'Your request is being reviewed'
  },
  confirmed: {
    label: 'Confirmado',
    labelEn: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle2,
    description: 'Tu servicio ha sido confirmado',
    descriptionEn: 'Your service has been confirmed'
  },
  assigned: {
    label: 'Asignado',
    labelEn: 'Assigned',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
    description: 'Conductor asignado',
    descriptionEn: 'Driver assigned'
  },
  completed: {
    label: 'Completado',
    labelEn: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
    description: 'Servicio completado',
    descriptionEn: 'Service completed'
  },
  cancelled: {
    label: 'Cancelado',
    labelEn: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
    description: 'Servicio cancelado',
    descriptionEn: 'Service cancelled'
  }
};

export default function TrackingPage() {
  const params = useParams();
  const { t, language } = useLanguage();
  const trackingId = params.id as string;
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar en localStorage
    try {
      const bookingsStr = localStorage.getItem('bookings');
      if (!bookingsStr) {
        setTrackingData(null);
        setLoading(false);
        return;
      }
      
      const bookings = JSON.parse(bookingsStr);
      if (!Array.isArray(bookings)) {
        setTrackingData(null);
        setLoading(false);
        return;
      }
      
      // Buscar el booking con el trackingId (case insensitive)
      const booking = bookings.find((b: any) => 
        b.trackingId && b.trackingId.toUpperCase() === trackingId.toUpperCase()
      );
      
      if (booking) {
        setTrackingData({
          ...booking,
          status: booking.status || 'pending'
        });
      } else {
        setTrackingData(null);
      }
    } catch (error) {
      console.error('Error loading tracking data:', error);
      setTrackingData(null);
    }
    setLoading(false);
  }, [trackingId]);

  const formatTime = (time: string, period: string) => {
    return `${time} ${period}`;
  };

  const getStatusInfo = () => {
    if (!trackingData) return null;
    const status = trackingData.status;
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return {
      ...config,
      label: language === 'es' ? config.label : config.labelEn,
      description: language === 'es' ? config.description : config.descriptionEn,
      Icon
    };
  };

  const getVehicleType = (passengers: number) => {
    if (passengers <= 3) return 'Automóvil';
    if (passengers === 4) return 'Camioneta SUV';
    if (passengers <= 10) return 'Van';
    if (passengers <= 18) return 'Van Grande';
    return 'Bus';
  };

  const getVehicleImage = (passengers: number, vehicleImage?: string) => {
    if (vehicleImage) return vehicleImage;
    if (passengers <= 4) return '/auto-removebg-preview.png';
    if (passengers <= 10) return '/van-removebg-preview.png';
    return '/bus-removebg-preview.png';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!trackingData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'es' ? 'Reserva no encontrada' : 'Reservation not found'}
          </h1>
          <p className="text-gray-600">
            {language === 'es' 
              ? 'No se encontró una reserva con este código de seguimiento.'
              : 'No reservation found with this tracking code.'}
          </p>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  if (!statusInfo) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Banner */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-full ${statusInfo.color}`}>
              <statusInfo.Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">
                {language === 'es' ? 'Estado de tu Reserva' : 'Reservation Status'}
              </h1>
              <p className="text-gray-600">{statusInfo.description}</p>
            </div>
            <div className={`px-4 py-2 rounded-full font-medium ${statusInfo.color}`}>
              {statusInfo.label}
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-1">
              {language === 'es' ? 'Código de seguimiento' : 'Tracking code'}
            </p>
            <p className="font-mono text-lg font-semibold">{trackingId}</p>
          </div>
        </div>

        {/* Service Details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'es' ? 'Detalles del Servicio' : 'Service Details'}
          </h2>
          
          <div className="space-y-4">
            {/* Service */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
              <div className="relative w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                {trackingData.serviceImage.startsWith('/') ? (
                  <Image
                    src={trackingData.serviceImage}
                    alt={trackingData.serviceName}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <span className="text-2xl flex items-center justify-center h-full">
                    {trackingData.serviceImage}
                  </span>
                )}
              </div>
              <div>
                <p className="font-semibold text-lg">{trackingData.serviceName}</p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {t('origin')}
                </p>
                <p className="font-medium">{trackingData.from}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {t('destination')}
                </p>
                <p className="font-medium">{trackingData.to}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {t('date')}
                </p>
                <p className="font-medium">{trackingData.date}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {t('time')}
                </p>
                <p className="font-medium">{formatTime(trackingData.time, trackingData.timePeriod)}</p>
              </div>
            </div>

            {/* Flight Number */}
            {trackingData.flightNumber && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Plane className="w-3 h-3" />
                  {t('flightNumber')}
                </p>
                <p className="font-medium">{trackingData.flightNumber}</p>
              </div>
            )}

            {/* Passengers and Vehicle */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {t('passengers')} y {language === 'es' ? 'Vehículo' : 'Vehicle'}
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-24 h-16 flex-shrink-0">
                  <Image
                    src={getVehicleImage(trackingData.passengers, trackingData.vehicleImage)}
                    alt={getVehicleType(trackingData.passengers)}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    {trackingData.passengers} {trackingData.passengers === 1 
                      ? (language === 'es' ? 'pasajero' : 'passenger')
                      : (language === 'es' ? 'pasajeros' : 'passengers')}
                  </p>
                  <p className="text-sm text-gray-600">{getVehicleType(trackingData.passengers)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {language === 'es' ? 'Información de Contacto' : 'Contact Information'}
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                {t('name')}
              </p>
              <p className="font-medium">{trackingData.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {t('whatsapp')}
              </p>
              <p className="font-medium">{trackingData.whatsapp}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {t('email')}
              </p>
              <p className="font-medium">{trackingData.email}</p>
            </div>
          </div>
        </div>

        {/* Driver/Vehicle Info (if assigned) */}
        {(trackingData.status === 'assigned' || trackingData.status === 'completed') && trackingData.driver && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'es' ? 'Información del Conductor' : 'Driver Information'}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">
                  {language === 'es' ? 'Conductor' : 'Driver'}
                </p>
                <p className="font-medium">{trackingData.driver}</p>
              </div>
              {trackingData.vehicle && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">
                    {language === 'es' ? 'Vehículo' : 'Vehicle'}
                  </p>
                  <p className="font-medium">{trackingData.vehicle}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quote */}
        {trackingData.quote && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {language === 'es' ? 'Cotización' : 'Quote'}
            </h2>
            <p className="text-2xl font-bold">
              ${trackingData.quote.toLocaleString('es-CO')} COP
            </p>
          </div>
        )}

      </main>
    </div>
  );
}


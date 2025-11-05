'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookingData } from './index';
import { MapPin, Calendar, Clock, Users, User, Phone, Mail, Plane } from 'lucide-react';

interface SummaryProps {
  data: BookingData;
  serviceName: string;
  serviceImage: string;
  serviceId: string;
  onConfirm: () => void;
  onBack: () => void;
}

const passengerGroups = [
  { min: 1, max: 3, image: '/auto-removebg-preview.png', type: 'Automóvil' },
  { min: 4, max: 4, image: '/auto-removebg-preview.png', type: 'Camioneta SUV' },
  { min: 5, max: 10, image: '/van-removebg-preview.png', type: 'Van' },
  { min: 11, max: 18, image: '/van-removebg-preview.png', type: 'Van Grande' },
  { min: 19, max: 22, image: '/bus-removebg-preview.png', type: 'Bus' },
];

export default function Summary({ data, serviceName, serviceImage, serviceId, onConfirm, onBack }: SummaryProps) {
  const { t } = useLanguage();
  const isCustomTransport = serviceId === 'custom-transport';

  const getVehicleType = () => {
    const group = passengerGroups.find(g => data.passengers >= g.min && data.passengers <= g.max);
    return group?.type || 'Automóvil';
  };

  const getVehicleImage = () => {
    const group = passengerGroups.find(g => data.passengers >= g.min && data.passengers <= g.max);
    return group?.image || data.vehicleImage || '/auto-removebg-preview.png';
  };

  const formatTime = () => {
    return `${data.time} ${data.timePeriod}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold mb-6">
        Resumen de Reserva
      </h3>

      {/* Invoice-style summary */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Service */}
        <div className="pb-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">{t('service')}</p>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {serviceImage.startsWith('/') ? (
                <Image 
                  src={serviceImage} 
                  alt={serviceName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="text-2xl">{serviceImage}</span>
              )}
            </div>
            <p className="text-xl font-bold">{serviceName}</p>
          </div>
        </div>

        {/* Trip details */}
        <div className="space-y-4">
          {isCustomTransport ? (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                {t('hoursNeeded')}
              </p>
              <p className="font-semibold text-lg">{data.hoursNeeded} {t('hours')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                  <MapPin className="w-3 h-3" />
                  {t('origin')}
                </p>
                <p className="font-semibold text-lg">{data.from}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                  <MapPin className="w-3 h-3" />
                  {t('destination')}
                </p>
                <p className="font-semibold text-lg">{data.to}</p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Calendar className="w-3 h-3" />
                {t('date')}
              </p>
              <p className="font-semibold">{data.date}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                {t('time')}
              </p>
              <p className="font-semibold">{formatTime()}</p>
            </div>
          </div>

          {/* Flight Number */}
          {data.flightNumber && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Plane className="w-3 h-3" />
                {t('flightNumber')}
              </p>
              <p className="font-semibold">{data.flightNumber}</p>
            </div>
          )}

          {/* Passengers and Vehicle */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1 uppercase tracking-wide">
              <Users className="w-3 h-3" />
              {t('passengers')} y Vehículo
            </p>
            <div className="flex items-center gap-6">
              <div className="relative w-40 h-28 sm:w-48 sm:h-32 flex-shrink-0">
                <Image
                  src={getVehicleImage()}
                  alt={getVehicleType()}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 160px, 192px"
                />
              </div>
              <div>
                <p className="font-semibold text-lg">
                  {data.passengers} {data.passengers === 1 ? 'pasajero' : 'pasajeros'}
                </p>
                <p className="text-sm text-gray-600">{getVehicleType()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Contacto</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                {t('name')}
              </p>
              <p className="font-medium">{data.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {t('whatsapp')}
              </p>
              <p className="font-medium">{data.whatsapp}</p>
            </div>
            {data.email && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {t('email')}
                </p>
                <p className="font-medium">{data.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes and recommendations */}
        {(data.additionalNotes || data.recommendations.length > 0) && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Información adicional</p>
            {data.additionalNotes && (
              <p className="text-sm text-gray-700 mb-2">{data.additionalNotes}</p>
            )}
            {data.recommendations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.recommendations.map((rec) => (
                  <span key={rec} className="px-3 py-1 bg-white rounded-full text-xs font-medium border border-gray-200">
                    {rec}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quote */}
        <div className="pt-4 border-t-2 border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('quote')}</p>
              <p className="text-2xl font-bold text-black">
                {t('quotePending')}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Si el destino no está en lista, la cotización será confirmada por un asesor.
          </p>
        </div>
      </div>

      {/* Cancellation policy */}
      <p className="text-xs text-gray-500 text-center">
        {t('cancellationPolicy')}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-black hover:bg-gray-100 rounded-2xl font-medium transition-colors min-h-[44px] border-2 border-gray-200"
        >
          Volver a editar información
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors min-h-[44px]"
        >
          Confirmar servicio
        </button>
      </div>
    </motion.div>
  );
}

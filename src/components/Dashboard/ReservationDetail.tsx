'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { type Reservation } from '@/lib/mockData';
import { motion } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
  DollarSign,
  Car,
  Check,
  XCircle,
} from 'lucide-react';

interface ReservationDetailProps {
  reservation: Reservation;
  onClose: () => void;
}

export default function ReservationDetail({ reservation, onClose }: ReservationDetailProps) {
  const { t } = useLanguage();

  const statusSteps = [
    { key: 'toBeQuoted', label: t('toBeQuoted') },
    { key: 'scheduled', label: t('scheduled') },
    { key: 'assigned', label: t('assigned') },
    { key: 'completed', label: t('completed') },
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.key === reservation.status);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[90%] md:w-[80%] lg:w-[600px] xl:max-w-2xl bg-white z-50 overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold truncate">Detalle de Reserva</h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">#{reservation.code}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 ml-2"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Resumen</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Servicio</p>
                <p className="font-medium">{reservation.service}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha</p>
                  <p className="font-medium">{reservation.date}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Hora</p>
                  <p className="font-medium">{reservation.time}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Pasajeros</p>
                <p className="font-medium">{reservation.passengers} personas</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Canal</p>
                <p className="font-medium">{reservation.channel === 'hotel' ? 'Hotel' : reservation.channel === 'airbnb' ? 'Airbnb' : 'Directo'}</p>
                {reservation.partner && (
                  <p className="text-sm text-gray-600">{reservation.partner}</p>
                )}
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Cliente</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nombre</p>
                <p className="font-medium">{reservation.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{reservation.customerPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{reservation.customerEmail}</span>
              </div>
            </div>
          </div>

          {/* Route */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Ruta</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('from')}</p>
                  <p className="font-medium">{reservation.from}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">{t('to')}</p>
                  <p className="font-medium">{reservation.to}</p>
                </div>
              </div>
              {reservation.notes && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Notas</p>
                  <p className="text-sm text-gray-700">{reservation.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quote */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Cotización</h3>
              {!reservation.quote && (
                <button className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800">
                  {t('addQuote')}
                </button>
              )}
            </div>
            {reservation.quote ? (
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-semibold">
                  ${reservation.quote.toLocaleString()}
                </span>
              </div>
            ) : (
              <p className="text-gray-500">Pendiente por cotización</p>
            )}
          </div>

          {/* Driver & Vehicle */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Conductor & Vehículo</h3>
              {!reservation.driver && (
                <button className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800">
                  {t('assignDriver')}
                </button>
              )}
            </div>
            {reservation.driver ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">{reservation.driver}</span>
                </div>
                <p className="text-sm text-gray-600">{reservation.vehicle}</p>
              </div>
            ) : (
              <p className="text-gray-500">Sin conductor asignado</p>
            )}
          </div>

          {/* Status Timeline */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Estado & Progreso</h3>
            <div className="space-y-3">
              {statusSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 ${
                      isCompleted || isCurrent ? '' : 'opacity-40'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-black text-white'
                          : isCurrent
                          ? 'bg-accent text-black'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="text-xs font-bold">{index + 1}</span>
                      )}
                    </div>
                    <span className={`font-medium ${isCurrent ? 'text-black' : ''}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {reservation.status !== 'completed' && reservation.status !== 'cancelled' && (
              <>
                <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-green-700 transition-colors min-h-[44px] flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">{t('markCompleted')}</span>
                  <span className="sm:hidden">Completar</span>
                </button>
                <button className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl text-sm sm:text-base font-medium hover:bg-red-700 transition-colors min-h-[44px] flex items-center justify-center gap-2">
                  <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('cancel')}
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}


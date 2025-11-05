'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { type Reservation } from '@/lib/mockData';
import { Car, Bus, ArrowRight, MapPin, Calendar, Users, ExternalLink } from 'lucide-react';

interface ReservationCardProps {
  reservation: Reservation;
  onClick: () => void;
}

export default function ReservationCard({ reservation, onClick }: ReservationCardProps) {
  const { t } = useLanguage();

  const getVehicleIcon = () => {
    if (reservation.passengers <= 4) return Car;
    if (reservation.passengers <= 15) return Car;
    return Bus;
  };

  const VehicleIcon = getVehicleIcon();

  const statusStyles = {
    toBeQuoted: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    scheduled: 'bg-purple-50 text-purple-800 border-purple-200',
    assigned: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    completed: 'bg-green-50 text-green-800 border-green-200',
    cancelled: 'bg-gray-50 text-gray-800 border-gray-200',
  };


  return (
    <div
      onClick={onClick}
      className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:border-black hover:shadow-lg transition-all cursor-pointer"
    >
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left: Vehicle Icon */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <VehicleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </div>
        </div>

        {/* Center: Info */}
        <div className="flex-1 min-w-0">
          <div className="mb-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{reservation.service}</h3>
                {reservation.partner && (
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{reservation.partner}</p>
                )}
              </div>
              <span className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold border-2 flex-shrink-0 ${statusStyles[reservation.status]}`}>
                {t(reservation.status as any)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-3">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{reservation.date} • {reservation.time}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{reservation.passengers} {t('passengersLabel')}</span>
            </div>
          </div>

          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2 text-xs sm:text-sm mb-3">
            <div className="flex items-center gap-1 xs:gap-2 min-w-0 flex-1">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
              <span className="truncate text-gray-700">{reservation.from}</span>
            </div>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400 hidden xs:block" />
            <div className="flex items-center gap-1 xs:gap-2 min-w-0 flex-1">
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400 xs:hidden" />
              <span className="truncate text-gray-700">{reservation.to}</span>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-gray-600 mb-2">
            <strong>{reservation.customerName}</strong> • <span className="break-all">{reservation.customerPhone}</span>
          </div>

          {reservation.driver && (
            <div className="mt-2 text-xs sm:text-sm text-gray-600 flex items-center gap-2">
              <Car className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-gray-400" />
              <span className="truncate">{reservation.driver} • {reservation.vehicle}</span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-row lg:flex-col gap-2 flex-shrink-0">
          {reservation.status === 'toBeQuoted' && (
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="px-3 sm:px-4 py-2 bg-black text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap min-h-[44px] flex-1 lg:flex-none"
            >
              {t('addQuote')}
            </button>
          )}
          {reservation.status === 'scheduled' && (
            <button
              onClick={(e) => { e.stopPropagation(); }}
              className="px-3 sm:px-4 py-2 bg-black text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap min-h-[44px] flex-1 lg:flex-none"
            >
              {t('assignDriver')}
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); }}
            className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs sm:text-sm font-medium hover:border-black transition-colors whitespace-nowrap min-h-[44px] flex items-center justify-center gap-1 sm:gap-2 flex-1 lg:flex-none"
          >
            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('viewStatus')}</span>
            <span className="sm:hidden">Ver</span>
          </button>
        </div>
      </div>
    </div>
  );
}


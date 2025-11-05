'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockDrivers } from '@/lib/mockData';
import { Phone, Star, Car } from 'lucide-react';

export default function DriversPage() {
  const { t } = useLanguage();

  const statusStyles = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-orange-100 text-orange-800',
    inactive: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('drivers')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Gestión de conductores y vehículos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {mockDrivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 hover:border-black hover:shadow-lg transition-all"
          >
            {/* Avatar */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-800 text-white rounded-full flex items-center justify-center text-lg sm:text-2xl font-bold mb-3 sm:mb-4">
              {driver.name.split(' ').map(n => n[0]).join('')}
            </div>

            {/* Info */}
            <h3 className="text-base sm:text-lg font-semibold mb-1 truncate">{driver.name}</h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
              <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="truncate">{driver.phone}</span>
            </div>

            {/* Status */}
            <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-medium mb-3 sm:mb-4 ${statusStyles[driver.status]}`}>
              {driver.status === 'available' ? 'Disponible' : driver.status === 'occupied' ? 'Ocupado' : 'Inactivo'}
            </span>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Servicios</p>
                <p className="text-base sm:text-lg font-bold">{driver.completedServices}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Calificación</p>
                <p className="text-base sm:text-lg font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                  {driver.rating}
                </p>
              </div>
            </div>

            {/* Vehicle */}
            <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-xl">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">{driver.vehicle}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


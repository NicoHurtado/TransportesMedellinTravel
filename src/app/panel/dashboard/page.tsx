'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockReservations, type Reservation } from '@/lib/mockData';
import ReservationCard from '@/components/Dashboard/ReservationCard';
import ReservationDetail from '@/components/Dashboard/ReservationDetail';
import { Filter } from 'lucide-react';

export default function DashboardTraysPage() {
  const { t } = useLanguage();
  const [reservations] = useState<Reservation[]>(mockReservations);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const statusList = [
    { key: 'all', label: 'Todos', count: reservations.length },
    { key: 'toBeQuoted', label: t('toBeQuoted'), count: reservations.filter(r => r.status === 'toBeQuoted').length },
    { key: 'scheduled', label: t('scheduled'), count: reservations.filter(r => r.status === 'scheduled').length },
    { key: 'assigned', label: t('assigned'), count: reservations.filter(r => r.status === 'assigned').length },
    { key: 'completed', label: t('completed'), count: reservations.filter(r => r.status === 'completed').length },
    { key: 'cancelled', label: t('cancelled'), count: reservations.filter(r => r.status === 'cancelled').length },
  ];

  const filteredReservations = filterStatus === 'all'
    ? reservations
    : reservations.filter(r => r.status === filterStatus);

  return (
    <>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('trays')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Gestiona todas las reservas por estado</p>
      </div>

      {/* Quick Filters */}
      <div className="mb-4 sm:mb-6 flex flex-wrap gap-2 sm:gap-3">
        <button className="px-3 sm:px-4 py-2 bg-black text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-800 transition-colors min-h-[44px] whitespace-nowrap">
          {t('today')}
        </button>
        <button className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-black transition-colors min-h-[44px] whitespace-nowrap">
          {t('tomorrow')}
        </button>
        <button className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-black transition-colors min-h-[44px] whitespace-nowrap">
          {t('thisWeek')}
        </button>
        <button className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-black transition-colors min-h-[44px] ml-auto flex items-center gap-1 sm:gap-2">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden xs:inline">Filtros avanzados</span>
          <span className="xs:hidden">Filtros</span>
        </button>
      </div>

      {/* Status Tabs */}
      <div className="mb-4 sm:mb-6 overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex gap-2 min-w-max pb-2">
          {statusList.map((status) => {
            const isActive = filterStatus === status.key;
            return (
              <button
                key={status.key}
                onClick={() => setFilterStatus(status.key)}
                className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium transition-colors whitespace-nowrap min-h-[44px] ${
                  isActive
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                {status.label}
                {status.count > 0 && (
                  <span className={`ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {status.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reservations Grid */}
      <div className="grid gap-4">
        {filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay reservas en este estado</p>
          </div>
        ) : (
          filteredReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onClick={() => setSelectedReservation(reservation)}
            />
          ))
        )}
      </div>

      {/* Detail Panel */}
      {selectedReservation && (
        <ReservationDetail
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </>
  );
}


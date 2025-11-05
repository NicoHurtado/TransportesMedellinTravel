'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarPage() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('calendar')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Planificación visual de reservas</p>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold">Noviembre 2025</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-black text-white rounded-xl text-sm sm:text-base font-medium min-h-[44px]">
              {t('today')}
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0">
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <button className="px-3 sm:px-4 py-2 bg-black text-white rounded-xl text-sm sm:text-base font-medium whitespace-nowrap min-h-[44px]">
            Día
          </button>
          <button className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-black whitespace-nowrap min-h-[44px]">
            Semana
          </button>
          <button className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-black whitespace-nowrap min-h-[44px]">
            Mes
          </button>
        </div>

        {/* Calendar Placeholder */}
        <div className="text-center py-8 sm:py-12 px-4">
          <CalendarIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
          <p className="text-sm sm:text-base text-gray-500">Vista de calendario en desarrollo</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            La vista de Bandejas muestra todas las reservas organizadas por estado
          </p>
        </div>
      </div>
    </div>
  );
}


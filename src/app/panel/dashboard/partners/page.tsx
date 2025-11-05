'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { mockPartners } from '@/lib/mockData';
import { Copy, Eye } from 'lucide-react';

export default function PartnersPage() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('partners')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Hoteles aliados</p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {mockPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 hover:border-black hover:shadow-lg transition-all"
          >
            <div className="flex flex-col lg:flex-row items-start gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                {partner.type === 'hotel' ? '🏨' : '🏠'}
              </div>

              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-lg sm:text-xl font-semibold mb-1 truncate">{partner.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">{partner.city}</p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reservas este mes</p>
                    <p className="text-xl sm:text-2xl font-bold">{partner.reservationsThisMonth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tasa de cancelación</p>
                    <p className="text-xl sm:text-2xl font-bold">{partner.cancellationRate}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <code className="flex-1 text-xs sm:text-sm font-mono truncate">{partner.code}</code>
                  <button className="p-2 hover:bg-gray-200 rounded-lg flex-shrink-0">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none px-4 py-2 bg-black text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-800 flex items-center justify-center gap-2 min-h-[44px]">
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="sm:hidden">Ver detalles</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


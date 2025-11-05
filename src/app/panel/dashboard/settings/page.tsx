'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const { t } = useLanguage();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('settings')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Configuración del sistema</p>
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 md:p-8">
        <div className="text-center py-8 sm:py-12">
          <SettingsIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
          <p className="text-sm sm:text-base text-gray-500 mb-2">Panel de ajustes</p>
          <p className="text-xs sm:text-sm text-gray-400 px-4">
            Aquí se podrán configurar políticas, mensajes estándar y branding
          </p>
        </div>
      </div>
    </div>
  );
}


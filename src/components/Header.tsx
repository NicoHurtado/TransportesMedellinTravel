'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import HotelModal from './HotelModal';

export default function Header() {
  const { language, toggleLanguage, t } = useLanguage();
  const [showHotelModal, setShowHotelModal] = useState(false);
  const [linkedHotel, setLinkedHotel] = useState<string | null>(null);

  const handleHotelLink = (code: string) => {
    // In a real app, validate the code with an API
    setLinkedHotel(`Hotel ${code.toUpperCase()}`);
    setShowHotelModal(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/medellintravel.png"
                alt="Medellín Travel"
                width={200}
                height={60}
                className="h-10 sm:h-12 w-auto"
                priority
              />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Language toggle with flag */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-2 text-sm sm:text-base font-medium text-black hover:bg-gray-50 rounded-xl transition-colors min-h-[44px]"
                aria-label="Toggle language"
              >
                <span className="text-lg">{language === 'es' ? '🇺🇸' : '🇪🇸'}</span>
                <span>{language === 'es' ? 'EN' : 'ES'}</span>
              </button>

              {/* Hotel link - discrete underlined */}
              <button
                onClick={() => setShowHotelModal(true)}
                className="text-xs sm:text-sm text-gray-600 hover:text-black underline underline-offset-4 transition-colors py-2 min-h-[44px]"
              >
                {t('hotelLogin')}
              </button>
            </div>
          </div>

          {/* Linked hotel notification */}
          {linkedHotel && (
            <div className="pb-3 pt-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded-full text-xs sm:text-sm">
                <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                <span>
                  {t('hotelLinked')}: <strong>{linkedHotel}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hotel Modal */}
      <HotelModal
        isOpen={showHotelModal}
        onClose={() => setShowHotelModal(false)}
        onLink={handleHotelLink}
      />
    </>
  );
}


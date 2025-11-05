'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { Car, Bus } from 'lucide-react';

interface VehicleIllustrationProps {
  passengers: number;
}

export default function VehicleIllustration({ passengers }: VehicleIllustrationProps) {
  const { t } = useLanguage();

  const getVehicleType = () => {
    if (passengers <= 4) return 'car';
    if (passengers <= 15) return 'van';
    return 'bus';
  };

  const vehicleType = getVehicleType();

  const vehicleLabels = {
    car: t('car'),
    van: t('van'),
    bus: t('bus'),
  };

  return (
    <motion.div
      key={vehicleType}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-50 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center"
    >
      {/* Vehicle Icon */}
      <div className="mb-4">
        {vehicleType === 'bus' ? (
          <Bus className="w-24 h-24 sm:w-32 sm:h-32 text-black" strokeWidth={1.5} />
        ) : vehicleType === 'van' ? (
          <svg className="w-24 h-24 sm:w-32 sm:h-32 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 11V5h14v6M5 11h14M5 11v8h2m12-8v8h-2m0 0h-10m0 0v0a2 2 0 002 2h6a2 2 0 002-2v0" />
            <circle cx="7" cy="16" r="2" />
            <circle cx="17" cy="16" r="2" />
          </svg>
        ) : (
          <Car className="w-24 h-24 sm:w-32 sm:h-32 text-black" strokeWidth={1.5} />
        )}
      </div>

      {/* Vehicle label */}
      <div className="text-center">
        <p className="text-2xl font-semibold text-black mb-1">
          {vehicleLabels[vehicleType]}
        </p>
        <p className="text-sm text-gray-500">
          {passengers} {t('passengersLabel')}
        </p>
      </div>

      {/* Active indicator */}
      <div className="w-2 h-2 bg-accent rounded-full mt-4" />
    </motion.div>
  );
}


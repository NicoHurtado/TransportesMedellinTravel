'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookingData } from './index';
import { MapPin, Calendar, Clock, Users, Plane } from 'lucide-react';
import Image from 'next/image';

interface TripDetailsProps {
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  serviceId: string;
}

const passengerGroups = [
  { label: '1 a 3 personas', min: 1, max: 3, image: '/auto-removebg-preview.png', type: 'automóvil' },
  { label: '4 personas', min: 4, max: 4, image: '/auto-removebg-preview.png', type: 'camioneta SUV' },
  { label: '5 a 10 personas', min: 5, max: 10, image: '/van-removebg-preview.png', type: 'van' },
  { label: '11 a 18 personas', min: 11, max: 18, image: '/van-removebg-preview.png', type: 'van grande' },
  { label: '19 a 22 personas', min: 19, max: 22, image: '/bus-removebg-preview.png', type: 'bus' },
];

// Airport names will be constructed using translations

export default function TripDetails({ data, updateData, onNext, serviceId }: TripDetailsProps) {
  const { t, language } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [direction, setDirection] = useState<'to' | 'from' | null>(null);
  const [selectedAirport, setSelectedAirport] = useState<'jmc' | 'olaya' | null>(null);
  
  // Convert 24h time to 12h format
  const convert24to12 = (time24: string): { hour: number; minute: number; period: 'AM' | 'PM' } => {
    if (!time24) return { hour: 12, minute: 0, period: 'PM' };
    const [hour24, minute] = time24.split(':').map(Number);
    let hour12 = hour24 % 12;
    if (hour12 === 0) hour12 = 12;
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return { hour: hour12, minute: minute || 0, period };
  };

  // Convert 12h format to 24h for time input
  const convert12to24 = (hour: number, minute: number, period: 'AM' | 'PM'): string => {
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 = hour + 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // Handle time input for mobile (time picker)
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time24 = e.target.value;
    if (time24) {
      const { hour, minute, period } = convert24to12(time24);
      updateData({ 
        time: `${hour}:${String(minute).padStart(2, '0')}`,
        timePeriod: period
      });
    }
  };

  // Handle manual time input for desktop (1-12 format)
  const handleTimeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove non-numeric characters except colon
    value = value.replace(/[^\d:]/g, '');
    
    // Handle hour input (1-12)
    if (value.includes(':')) {
      const [hourStr, minuteStr] = value.split(':');
      const hour = parseInt(hourStr) || 0;
      const minute = parseInt(minuteStr) || 0;
      
      // Validate hour (1-12)
      if (hourStr && (hour < 1 || hour > 12)) {
        return; // Don't update if invalid
      }
      
      // Validate minute (0-59)
      if (minuteStr && (minute < 0 || minute > 59)) {
        return; // Don't update if invalid
      }
      
      // Format minute to 2 digits max
      if (minuteStr && minuteStr.length > 2) {
        return;
      }
      
      updateData({ time: value });
    } else {
      // Only hour entered, validate 1-12
      const hour = parseInt(value) || 0;
      if (value === '' || (hour >= 1 && hour <= 12)) {
        updateData({ time: value });
      }
    }
  };
  
  const isAirportTransfer = serviceId === 'airport-transfer';
  const isCustomTransport = serviceId === 'custom-transport';
  const isTour = serviceId.includes('-tour');

  const getVehicleImage = () => {
    // Find vehicle based on current passenger count
    const group = passengerGroups.find(g => data.passengers >= g.min && data.passengers <= g.max);
    return group?.image || data.vehicleImage || '/auto-removebg-preview.png';
  };

  const handlePassengerGroupSelect = (index: number) => {
    const group = passengerGroups[index];
    setSelectedGroup(index);
    const newPassengers = group.min;
    updateData({ 
      passengers: newPassengers,
      vehicleImage: group.image 
    });
  };

  // Update vehicle image when passengers change (but only if not manually selected)
  useEffect(() => {
    if (selectedGroup === null) {
      const group = passengerGroups.find(g => data.passengers >= g.min && data.passengers <= g.max);
      if (group && data.vehicleImage !== group.image) {
        updateData({ vehicleImage: group.image });
      }
    }
  }, [data.passengers, selectedGroup]);

  // Auto-fill destination for tours
  useEffect(() => {
    if (isTour && !data.to) {
      // Get the service name from the translation
      const tourNames: { [key: string]: string } = {
        'guatape-tour': t('guatapeTour'),
        'graffiti-tour': t('graffitiTour'),
        'city-tour': t('cityTour'),
        'hacienda-napoles-tour': t('haciendaNapolesTour'),
        'occidente-tour': t('occidenteTour'),
        'parapente-tour': t('parapenteTour'),
        'jardin-tour': t('jardinTour'),
      };
      const tourName = tourNames[serviceId] || serviceId;
      updateData({ to: tourName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTour, serviceId]);

  // Handle airport selection
  const handleDirectionSelect = (dir: 'to' | 'from') => {
    // First, clear the previously selected airport field if direction is changing
    const airportPrefix = language === 'es' ? 'Aeropuerto' : 'Airport';
    const airportPrefixLower = airportPrefix.toLowerCase();
    
    const updates: Partial<BookingData> = {};
    
    // If we had a previous direction and it was different, clear the airport field
    if (direction !== null && direction !== dir) {
      // Previous direction was opposite, so clear the field that was filled
      if (direction === 'from') {
        // Was coming from airport (origin was filled), now going to airport
        // Clear origin if it contains airport
        if (data.from && data.from.toLowerCase().includes(airportPrefixLower)) {
          updates.from = '';
        }
      } else {
        // Was going to airport (destination was filled), now coming from airport
        // Clear destination if it contains airport
        if (data.to && data.to.toLowerCase().includes(airportPrefixLower)) {
          updates.to = '';
        }
      }
    }
    
    // Always clear the field that will be auto-filled with the new airport selection
    if (dir === 'to') {
      updates.to = '';
    } else {
      updates.from = '';
    }
    
    // Update state
    setDirection(dir);
    setSelectedAirport(null);
    updateData(updates);
  };

  const handleAirportSelect = (airport: 'jmc' | 'olaya') => {
    setSelectedAirport(airport);
    let airportName = '';
    // Use "Airport" in English, "Aeropuerto" in Spanish
    const airportPrefix = language === 'es' ? 'Aeropuerto' : 'Airport';
    if (airport === 'jmc') {
      airportName = `${airportPrefix} ${t('airportJMC')} (${t('airportJMCSub')})`;
    } else {
      airportName = `${airportPrefix} ${t('airportOlaya')} (${t('airportOlayaSub')})`;
    }
    
    if (direction === 'to') {
      updateData({ to: airportName });
    } else if (direction === 'from') {
      updateData({ from: airportName });
    }
  };

  const isValid = 
    (isCustomTransport ? data.hoursNeeded : (data.from && data.to)) &&
    data.date && data.time && data.passengers > 0 &&
    (!isAirportTransfer || (direction !== null && selectedAirport !== null)) &&
    (!isTour || data.to !== ''); // For tours, destination should be filled

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold mb-6">
        {isAirportTransfer ? t('airportTransportTitle') : isCustomTransport ? t('customTransport') : `${t('from')} → ${t('to')}`}
      </h3>

      {/* Airport Transfer Special Selection */}
      {isAirportTransfer && (
        <>
          {/* Direction Selection */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">
              {t('airportDirectionQuestion')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleDirectionSelect('to')}
                className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] ${
                  direction === 'to'
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-200 hover:border-black'
                }`}
              >
                {t('toAirport')}
              </button>
              <button
                type="button"
                onClick={() => handleDirectionSelect('from')}
                className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] ${
                  direction === 'from'
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-200 hover:border-black'
                }`}
              >
                {t('fromAirport')}
              </button>
            </div>
          </div>

          {/* Airport Selection */}
          {direction !== null && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">
                {t('selectAirport')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAirportSelect('jmc')}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] text-left ${
                    selectedAirport === 'jmc'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 hover:border-black'
                  }`}
                >
                  {t('airportJMC')}
                  <br />
                  <span className="text-xs opacity-80">{t('airportJMCSub')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAirportSelect('olaya')}
                  className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] text-left ${
                    selectedAirport === 'olaya'
                      ? 'bg-black text-white border-black'
                      : 'bg-white border-gray-200 hover:border-black'
                  }`}
                >
                  {t('airportOlaya')}
                  <br />
                  <span className="text-xs opacity-80">{t('airportOlayaSub')}</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Custom Transport: Hours Needed */}
      {isCustomTransport ? (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            {t('hoursNeeded')}
          </label>
          <input
            type="number"
            min="1"
            max="24"
            value={data.hoursNeeded}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 24)) {
                updateData({ hoursNeeded: value });
              }
            }}
            placeholder={t('hoursNeededPlaceholder')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
            style={{ fontSize: '16px' }}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            {language === 'es' 
              ? 'Especifica la cantidad de horas que necesitas el servicio disponible.'
              : 'Specify the number of hours you need the service available.'}
          </p>
        </div>
      ) : (
        <>
      {/* From */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          {t('from')}
        </label>
        <input
          type="text"
          value={data.from}
              onChange={(e) => {
                if (!isAirportTransfer || direction !== 'from') {
                  updateData({ from: e.target.value });
                }
              }}
              placeholder={isAirportTransfer && direction === 'from' ? t('selectAirportAbove') : t('fromPlaceholder')}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] ${
                isAirportTransfer && direction === 'from' ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              style={{ fontSize: '16px' }}
              required={!isCustomTransport}
              disabled={isAirportTransfer && direction === 'from'}
        />
        <p className="text-xs text-gray-500 mt-1">{t('tip')}</p>
      </div>

      {/* To */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          {t('to')}
        </label>
        <input
          type="text"
          value={data.to}
              onChange={(e) => {
                if (!isAirportTransfer && !isTour) {
                  if (direction !== 'to') {
                    updateData({ to: e.target.value });
                  }
                }
              }}
              placeholder={isAirportTransfer && direction === 'to' ? t('selectAirportAbove') : t('toPlaceholder')}
              className={`w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] ${
                (isAirportTransfer && direction === 'to') || isTour ? 'bg-gray-50 cursor-not-allowed' : ''
              }`}
              style={{ fontSize: '16px' }}
              required={!isCustomTransport}
              disabled={(isAirportTransfer && direction === 'to') || isTour}
        />
        <p className="text-xs text-gray-500 mt-1">{t('tip')}</p>
      </div>
        </>
      )}

      {/* Flight Number */}
      {isAirportTransfer && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Plane className="w-4 h-4" />
            {t('flightNumber')}
          </label>
          <input
            type="text"
            value={data.flightNumber}
            onChange={(e) => updateData({ flightNumber: e.target.value.toUpperCase() })}
            placeholder={t('flightNumberPlaceholder')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
            style={{ fontSize: '16px' }}
          />
        </div>
      )}

      {/* Date and Time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Calendar className="w-4 h-4" />
            {t('date')}
          </label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => updateData({ date: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
            style={{ fontSize: '16px' }}
            required
          />
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium mb-2">
            <Clock className="w-4 h-4" />
            {t('time')}
          </label>
          <div className="flex gap-2">
            {/* Mobile: Time picker (native) */}
          <input
            type="time"
              value={data.time ? convert12to24(
                parseInt(data.time.split(':')[0]) || 12,
                parseInt(data.time.split(':')[1]) || 0,
                data.timePeriod || 'PM'
              ) : ''}
              onChange={handleTimeChange}
              placeholder="12:30"
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors md:hidden text-base min-h-[48px]"
              style={{ fontSize: '16px' }}
              required
            />
            {/* Desktop: Manual input (1-12 format) */}
            <input
              type="text"
            value={data.time}
              onChange={handleTimeInput}
              placeholder="12:30"
              pattern="^(1[0-2]|[1-9]):[0-5][0-9]$"
              className="hidden md:flex flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
              style={{ fontSize: '16px' }}
            required
          />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => updateData({ timePeriod: 'AM' })}
                className={`px-3 sm:px-4 py-3 rounded-2xl font-medium transition-colors min-h-[48px] flex-shrink-0 ${
                  data.timePeriod === 'AM'
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => updateData({ timePeriod: 'PM' })}
                className={`px-3 sm:px-4 py-3 rounded-2xl font-medium transition-colors min-h-[48px] flex-shrink-0 ${
                  data.timePeriod === 'PM'
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Passengers */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-3">
          <Users className="w-4 h-4" />
          {t('passengers')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {passengerGroups.map((group, index) => {
            const isSelected = selectedGroup === index || 
              (selectedGroup === null && data.passengers >= group.min && data.passengers <= group.max);
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => handlePassengerGroupSelect(index)}
                className={`px-4 py-3 rounded-2xl font-medium transition-all border-2 min-h-[60px] ${
                  isSelected
                    ? 'bg-black text-white border-black'
                    : 'bg-white border-gray-200 hover:border-black'
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>
        
        {/* Vehicle Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={getVehicleImage()}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center my-8"
          >
            <div className="relative w-80 h-56 sm:w-96 sm:h-64">
              <Image
                src={getVehicleImage()}
                alt="Vehículo"
                fill
                className="object-contain"
                sizes="(max-width: 640px) 320px, 384px"
              />
            </div>
          </motion.div>
        </AnimatePresence>
        
        <p className="text-xs text-gray-500 text-center">
          El vehículo se selecciona automáticamente según la cantidad de pasajeros.
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
        >
          {t('next')}
        </button>
      </div>
    </motion.form>
  );
}

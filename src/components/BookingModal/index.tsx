'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import StepIndicator from './StepIndicator';
import TripDetails from './TripDetails';
import ContactInfo from './ContactInfo';
import NotesRecommendations from './NotesRecommendations';
import Summary from './Summary';
import Confirmation from './Confirmation';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  serviceImage: string;
}

export interface BookingData {
  // Trip details
  from: string;
  to: string;
  date: string;
  time: string;
  timePeriod: 'AM' | 'PM';
  passengers: number;
  vehicleImage: string;
  flightNumber: string;
  hoursNeeded: string; // For custom transport
  
  // Contact
  name: string;
  whatsapp: string;
  email: string;
  
  // Notes
  additionalNotes: string;
  recommendations: string[];
}

export default function BookingModal({ isOpen, onClose, serviceId, serviceName, serviceImage }: BookingModalProps) {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [trackingId] = useState(() => Math.random().toString(36).substr(2, 9).toUpperCase());
  
  const [bookingData, setBookingData] = useState<BookingData>({
    from: '',
    to: '',
    date: '',
    time: '',
    timePeriod: 'AM',
    passengers: 1,
    vehicleImage: '/auto-removebg-preview.png',
    flightNumber: '',
    hoursNeeded: '',
    name: '',
    whatsapp: '',
    email: '',
    additionalNotes: '',
    recommendations: [],
  });

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  // Auto-fill destination for tours when modal opens
  useEffect(() => {
    if (isOpen && serviceId.includes('-tour')) {
      const tourNames: { [key: string]: string } = {
        'guatape-tour': t('guatapeTour'),
        'graffiti-tour': t('graffitiTour'),
        'city-tour': t('cityTour'),
        'hacienda-napoles-tour': t('haciendaNapolesTour'),
        'occidente-tour': t('occidenteTour'),
        'parapente-tour': t('parapenteTour'),
        'jardin-tour': t('jardinTour'),
      };
      const tourName = tourNames[serviceId] || serviceName;
      setBookingData(prev => ({
        ...prev,
        to: tourName
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, serviceId]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleConfirm = () => {
    // In a real app, submit to API
    console.log('Booking confirmed:', { serviceId, ...bookingData });
    
    // Save to localStorage for tracking
    try {
      const bookingToSave = {
        trackingId: trackingId.toUpperCase(),
        serviceId,
        serviceName,
        serviceImage,
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const existingBookingsStr = localStorage.getItem('bookings');
      const existingBookings = existingBookingsStr 
        ? JSON.parse(existingBookingsStr) 
        : [];
      
      if (!Array.isArray(existingBookings)) {
        localStorage.setItem('bookings', JSON.stringify([bookingToSave]));
      } else {
        existingBookings.push(bookingToSave);
        localStorage.setItem('bookings', JSON.stringify(existingBookings));
      }
      
      console.log('Saved booking with trackingId:', trackingId.toUpperCase());
    } catch (error) {
      console.error('Error saving booking:', error);
    }
    
    setIsConfirmed(true);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setIsConfirmed(false);
    setBookingData({
      from: '',
      to: '',
      date: '',
      time: '',
      timePeriod: 'AM',
      passengers: 1,
      vehicleImage: '/auto-removebg-preview.png',
      flightNumber: '',
      hoursNeeded: '',
      name: '',
      whatsapp: '',
      email: '',
      additionalNotes: '',
      recommendations: [],
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - Fixed height */}
              <div className="flex-shrink-0 bg-white border-b border-gray-100 rounded-t-2xl px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-h-[56px]">
                  {/* Service thumbnail */}
                  <div className="relative w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    {serviceImage.startsWith('/') ? (
                      <Image 
                        src={serviceImage} 
                        alt={serviceName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <span className="text-2xl">{serviceImage}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold truncate">{serviceName}</h2>
                    <div className="h-5">
                      {!isConfirmed && <StepIndicator currentStep={currentStep} totalSteps={4} />}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors ml-4 flex-shrink-0"
                  aria-label={t('close')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8">
                {!isConfirmed ? (
                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <TripDetails
                        data={bookingData}
                        updateData={updateBookingData}
                        onNext={handleNext}
                        serviceId={serviceId}
                      />
                    )}
                    {currentStep === 2 && (
                      <ContactInfo
                        data={bookingData}
                        updateData={updateBookingData}
                        onNext={handleNext}
                        onBack={handleBack}
                      />
                    )}
                    {currentStep === 3 && (
                      <NotesRecommendations
                        data={bookingData}
                        updateData={updateBookingData}
                        onNext={handleNext}
                        onBack={handleBack}
                      />
                    )}
                    {currentStep === 4 && (
                      <Summary
                        data={bookingData}
                        serviceName={serviceName}
                        serviceImage={serviceImage}
                        serviceId={serviceId}
                        onConfirm={handleConfirm}
                        onBack={handleBack}
                      />
                    )}
                  </AnimatePresence>
                ) : (
                  <Confirmation trackingId={trackingId} onClose={handleClose} />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


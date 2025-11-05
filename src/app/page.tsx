'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import ServiceCard from '@/components/ServiceCard';
import BookingModal from '@/components/BookingModal';

const services = [
  {
    id: 'airport-transfer',
    image: '/aeropuerto.avif',
    titleKey: 'airportTransfer',
    descriptionKey: 'airportTransferDesc',
  },
  {
    id: 'custom-transport',
    image: '/vip.png',
    titleKey: 'customTransport',
    descriptionKey: 'customTransportDesc',
  },
  {
    id: 'guatape-tour',
    image: '/guatape.jpg',
    titleKey: 'guatapeTour',
    descriptionKey: 'guatapeTourDesc',
  },
  {
    id: 'graffiti-tour',
    image: '/grafiti.avif',
    titleKey: 'graffitiTour',
    descriptionKey: 'graffitiTourDesc',
  },
  {
    id: 'city-tour',
    image: '/medellin.jpg',
    titleKey: 'cityTour',
    descriptionKey: 'cityTourDesc',
  },
  {
    id: 'hacienda-napoles-tour',
    image: '/haciendanapoles.jpg',
    titleKey: 'haciendaNapolesTour',
    descriptionKey: 'haciendaNapolesTourDesc',
  },
  {
    id: 'occidente-tour',
    image: '/occidente.jpg',
    titleKey: 'occidenteTour',
    descriptionKey: 'occidenteTourDesc',
  },
  {
    id: 'parapente-tour',
    image: '/parapente.jpg',
    titleKey: 'parapenteTour',
    descriptionKey: 'parapenteTourDesc',
  },
  {
    id: 'jardin-tour',
    image: '/medellin.jpg',
    titleKey: 'jardinTour',
    descriptionKey: 'jardinTourDesc',
  },
];

export default function Home() {
  const { t } = useLanguage();
  const [selectedService, setSelectedService] = useState<typeof services[0] | null>(null);

  const handleBook = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      setSelectedService(service);
    }
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section - Compact with Background Image */}
      <section className="relative h-[40vh] min-h-[350px] flex items-center justify-center text-white overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{ 
            backgroundImage: 'url(/heroimage.jpeg)',
            backgroundPosition: 'center 65%'
          }}
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {t('ourServices')}
          </h1>
          <p className="text-base sm:text-lg text-gray-200 mb-8">
            {t('serviceDescription')}
          </p>
          
          {/* Book now button with arrow */}
          <button
            onClick={scrollToServices}
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition-all hover:scale-105 min-h-[44px]"
          >
            {t('bookNow')}
            <svg 
              className="w-4 h-4 animate-bounce" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              id={service.id}
              image={service.image}
              titleKey={service.titleKey}
              descriptionKey={service.descriptionKey}
              onBook={handleBook}
            />
          ))}
        </div>
      </section>

      {/* Booking Modal */}
      {selectedService && (
        <BookingModal
          isOpen={!!selectedService}
          onClose={() => setSelectedService(null)}
          serviceId={selectedService.id}
          serviceName={t(selectedService.titleKey as any)}
          serviceImage={selectedService.image}
        />
      )}
    </>
  );
}


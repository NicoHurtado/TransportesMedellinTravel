'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface ServiceCardProps {
  id: string;
  image: string;
  titleKey: string;
  descriptionKey: string;
  onBook: (serviceId: string) => void;
}

export default function ServiceCard({ id, image, titleKey, descriptionKey, onBook }: ServiceCardProps) {
  const { t } = useLanguage();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => onBook(id)}
      className="group bg-white rounded-2xl overflow-hidden border-2 border-transparent hover:border-black transition-all shadow-sm hover:shadow-lg cursor-pointer flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 sm:h-56 bg-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 z-10" />
        {/* Service image */}
        {image.startsWith('/') ? (
          <Image 
            src={image} 
            alt={t(titleKey as any)}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            {image}
          </div>
        )}
        {/* Active indicator */}
        <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20" />
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-semibold mb-2 text-black">
          {t(titleKey as any)}
        </h3>
        <p className="text-gray-600 mb-6 leading-relaxed flex-1">
          {t(descriptionKey as any)}
        </p>

        <button
          onClick={() => onBook(id)}
          className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors min-h-[44px] mt-auto"
        >
          {t('book')}
        </button>
      </div>
    </motion.div>
  );
}


'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookingData } from './index';
import { User, Phone, Mail } from 'lucide-react';

interface ContactInfoProps {
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ContactInfo({ data, updateData, onNext, onBack }: ContactInfoProps) {
  const { t } = useLanguage();

  const validateWhatsApp = (value: string) => {
    // Validar formato +57 o sin prefijo
    const phoneRegex = /^(\+57)?[\s-]?[0-9]{10}$/;
    return !value || phoneRegex.test(value.replace(/\s/g, ''));
  };

  const validateEmail = (value: string) => {
    if (!value) return true; // Opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const isValid = data.name && 
    data.whatsapp && 
    validateWhatsApp(data.whatsapp) && 
    (!data.email || validateEmail(data.email));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      onNext();
    }
  };

  const formatWhatsApp = (value: string) => {
    // Si empieza con +57, mantenerlo, si no, agregarlo
    if (value && !value.startsWith('+57') && !value.startsWith('57')) {
      return value;
    }
    return value;
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
        Datos del pasajero o persona de contacto
      </h3>

      {/* Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <User className="w-4 h-4" />
          Nombre completo
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder="Tu nombre completo"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
          style={{ fontSize: '16px' }}
          required
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Phone className="w-4 h-4" />
          Número de WhatsApp o contacto
        </label>
        <input
          type="tel"
          value={data.whatsapp}
          onChange={(e) => {
            let value = e.target.value;
            // Si no empieza con +57, agregarlo automáticamente al escribir
            if (value && !value.startsWith('+') && !value.startsWith('57')) {
              value = '+57 ' + value;
            } else if (value.startsWith('57') && !value.startsWith('+57')) {
              value = '+57 ' + value.substring(2);
            }
            updateData({ whatsapp: value });
          }}
          placeholder="+57 300 123 4567"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
          style={{ fontSize: '16px' }}
          required
        />
        {data.whatsapp && !validateWhatsApp(data.whatsapp) && (
          <p className="text-xs text-red-500 mt-1">Formato inválido. Ejemplo: +57 300 123 4567</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Mail className="w-4 h-4" />
          {t('email')}
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          placeholder="correo@ejemplo.com"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
          style={{ fontSize: '16px' }}
        />
        {data.email && !validateEmail(data.email) && (
          <p className="text-xs text-red-500 mt-1">Formato de correo inválido</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {t('emailConfirmation')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-black hover:bg-gray-100 rounded-2xl font-medium transition-colors min-h-[44px]"
        >
          {t('back')}
        </button>
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

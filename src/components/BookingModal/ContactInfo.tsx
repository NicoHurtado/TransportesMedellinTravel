'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookingData } from './index';
import { User, Phone, Mail, Plus, X, CreditCard } from 'lucide-react';

interface ContactInfoProps {
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function ContactInfo({ data, updateData, onNext, onBack }: ContactInfoProps) {
  const { t } = useLanguage();
  
  // Initialize attendingPersons if not exists or is empty
  useEffect(() => {
    if (!data.attendingPersons || data.attendingPersons.length === 0) {
      updateData({
        attendingPersons: [{
          name: '',
          identificationNumber: '',
          identificationType: 'cedula',
        }],
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount
  
  const attendingPersons = data.attendingPersons && data.attendingPersons.length > 0 
    ? data.attendingPersons 
    : [{
        name: '',
        identificationNumber: '',
        identificationType: 'cedula' as 'cedula' | 'passport',
      }];

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

  const addPerson = () => {
    const newPerson = {
      name: '',
      identificationNumber: '',
      identificationType: 'cedula' as 'cedula' | 'passport',
    };
    updateData({
      attendingPersons: [...attendingPersons, newPerson],
    });
  };

  const removePerson = (index: number) => {
    const updated = attendingPersons.filter((_, i) => i !== index);
    updateData({
      attendingPersons: updated,
    });
  };

  const updatePerson = (index: number, field: 'name' | 'identificationNumber' | 'identificationType', value: string) => {
    const updated = [...attendingPersons];
    updated[index] = { ...updated[index], [field]: value };
    updateData({
      attendingPersons: updated,
    });
  };

  const isValid = data.name && 
    data.whatsapp && 
    validateWhatsApp(data.whatsapp) && 
    (!data.email || validateEmail(data.email)) &&
    attendingPersons.length > 0 &&
    attendingPersons.every(person => person.name && person.identificationNumber);

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
      <h3 className="text-2xl font-semibold mb-2">
        Datos del pasajero o persona de contacto
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        {t('contactInfoDescription')}
      </p>

      {/* Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <User className="w-4 h-4" />
          {t('name')}
        </label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => updateData({ name: e.target.value })}
          placeholder={t('namePlaceholder')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
          style={{ fontSize: '16px' }}
          required
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <Phone className="w-4 h-4" />
          {t('whatsapp')}
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
          placeholder={t('whatsappPlaceholder')}
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
          placeholder={t('emailPlaceholder')}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
          style={{ fontSize: '16px' }}
        />
        {data.email && !validateEmail(data.email) && (
          <p className="text-xs text-red-500 mt-1">Formato de correo inválido</p>
        )}
      </div>

      {/* Separator */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-xl font-semibold mb-4">
          {t('attendingPersonsTitle')}
        </h4>

        {/* Attending Persons List */}
        <div className="space-y-4">
          <AnimatePresence>
            {attendingPersons.map((person, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold text-gray-700">
                    {t('personNumber')} {index + 1}
                  </h5>
                  {attendingPersons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePerson(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={t('removePerson')}
                      aria-label={t('removePerson')}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Person Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <User className="w-4 h-4" />
                    {t('personName')}
                  </label>
                  <input
                    type="text"
                    value={person.name}
                    onChange={(e) => updatePerson(index, 'name', e.target.value)}
                    placeholder={t('personName')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>

                {/* Identification Type */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <CreditCard className="w-4 h-4" />
                    {t('identificationType')}
                  </label>
                  <div className="relative">
                    <select
                      value={person.identificationType}
                      onChange={(e) => updatePerson(index, 'identificationType', e.target.value)}
                      className="w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px] appearance-none bg-white cursor-pointer hover:border-gray-300"
                      style={{ fontSize: '16px' }}
                      required
                    >
                      <option value="cedula">{t('cedula')}</option>
                      <option value="passport">{t('passport')}</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Identification Number */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium mb-2">
                    <CreditCard className="w-4 h-4" />
                    {t('identificationNumber')}
                  </label>
                  <input
                    type="text"
                    value={person.identificationNumber}
                    onChange={(e) => updatePerson(index, 'identificationNumber', e.target.value)}
                    placeholder={t('identificationNumber')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors text-base min-h-[48px]"
                    style={{ fontSize: '16px' }}
                    required
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add Person Button */}
          <button
            type="button"
            onClick={addPerson}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-black hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-black"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">{t('addPerson')}</span>
          </button>
        </div>
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

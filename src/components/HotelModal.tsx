'use client';

import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLink: (code: string, nombre: string, id: number, comisiones: Array<{ id: number; servicio: string; vehiculoId: number; comision: number }>, comision?: number) => void;
}

export default function HotelModal({ isOpen, onClose, onLink }: HotelModalProps) {
  const { t } = useLanguage();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/hoteles/validate/${code.trim().toUpperCase()}`);
      const data = await response.json();

      if (data.success) {
        onLink(
          data.data.codigo,
          data.data.nombre,
          data.data.id,
          data.data.comisiones || [],
          data.data.comisionPorcentaje
        );
        setCode('');
        onClose();
      } else {
        setError('Código de hotel no válido. Por favor verifica el código e intenta nuevamente.');
      }
    } catch (err) {
      console.error('Error validating hotel code:', err);
      setError('Error al validar el código. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
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
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">{t('hotelCodeTitle')}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label={t('close')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setError(null);
                  }}
                  placeholder={t('hotelCodePlaceholder')}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                  disabled={loading}
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!code.trim() || loading}
                  className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {loading ? 'Validando...' : t('link')}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}


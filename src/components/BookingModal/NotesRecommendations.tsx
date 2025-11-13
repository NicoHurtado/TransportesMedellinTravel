'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { BookingData } from './index';
import { FileText } from 'lucide-react';

interface NotesRecommendationsProps {
  data: BookingData;
  updateData: (data: Partial<BookingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function NotesRecommendations({ data, updateData, onNext, onBack }: NotesRecommendationsProps) {
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
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
        Detalles adicionales o recomendaciones
      </h3>

      {/* Additional notes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <FileText className="w-4 h-4" />
          {t('specialRequest')}
        </label>
        <textarea
          value={data.additionalNotes}
          onChange={(e) => updateData({ additionalNotes: e.target.value })}
          placeholder={t('specialRequestPlaceholder')}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors resize-none text-base min-h-[48px]"
          style={{ fontSize: '16px' }}
        />
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
          className="flex-1 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors min-h-[44px]"
        >
          {t('next')}
        </button>
      </div>
    </motion.form>
  );
}

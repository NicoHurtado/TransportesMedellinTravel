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

const recommendationChips = [
  { id: 'pets', text: 'Llevo mascotas', autoText: 'Llevo mascotas' },
  { id: 'seniors', text: 'Viajo con adultos mayores', autoText: 'Viajo con adultos mayores' },
  { id: 'none', text: 'Ninguna', autoText: '' },
];

export default function NotesRecommendations({ data, updateData, onNext, onBack }: NotesRecommendationsProps) {
  const { t } = useLanguage();

  const handleChipClick = (chip: typeof recommendationChips[0]) => {
    if (chip.id === 'none') {
      updateData({ 
        recommendations: [],
        additionalNotes: ''
      });
      return;
    }

    const isSelected = data.recommendations.includes(chip.id);
    
    if (isSelected) {
      // Remover el chip seleccionado
      const newRecommendations = data.recommendations.filter(r => r !== chip.id);
      // Remover el texto relacionado del textarea
      const newNotes = data.additionalNotes
        .split(',')
        .map(n => n.trim())
        .filter(n => n !== chip.autoText && n !== '')
        .join(', ');
      
      updateData({ 
        recommendations: newRecommendations,
        additionalNotes: newNotes
      });
    } else {
      // Agregar el chip seleccionado
      const newRecommendations = [...data.recommendations, chip.id];
      // Agregar el texto al textarea si no está ya
      let newNotes = data.additionalNotes.trim();
      if (newNotes && !newNotes.endsWith(',')) {
        newNotes += ', ';
      }
      newNotes += chip.autoText;
      
      updateData({ 
        recommendations: newRecommendations,
        additionalNotes: newNotes.trim()
      });
    }
  };

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

      {/* Quick recommendations chips */}
      <div>
        <div className="flex flex-wrap gap-3 mb-4">
          {recommendationChips.map((chip) => {
            const isSelected = data.recommendations.includes(chip.id) || 
              (chip.id === 'none' && data.recommendations.length === 0);
            
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleChipClick(chip)}
                className={`px-4 py-2 rounded-full font-medium transition-colors min-h-[44px] ${
                  isSelected
                    ? 'bg-black text-white'
                    : 'bg-white border-2 border-gray-200 hover:border-black'
                }`}
              >
                {chip.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Additional notes */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium mb-2">
          <FileText className="w-4 h-4" />
          {t('additionalNotes')}
        </label>
        <textarea
          value={data.additionalNotes}
          onChange={(e) => updateData({ additionalNotes: e.target.value })}
          placeholder="Ej: llevo mascotas, 4 maletas grandes, silla infantil, vuelo AVIANCA 8522, etc."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-black transition-colors resize-none"
        />
        <p className="text-xs text-gray-500 mt-2">
          No hay costo adicional por mascotas, maletas o sillas infantiles.
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
          className="flex-1 py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors min-h-[44px]"
        >
          {t('next')}
        </button>
      </div>
    </motion.form>
  );
}

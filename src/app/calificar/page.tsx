'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Star, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CalificarPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  
  const [nombreCliente, setNombreCliente] = useState('');
  const [estrellas, setEstrellas] = useState(0);
  const [nota, setNota] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const translations = {
    es: {
      title: 'Califica tu Experiencia',
      subtitle: 'Tu opinión es muy importante para nosotros',
      nombreLabel: 'Tu nombre',
      nombrePlaceholder: 'Ingresa tu nombre',
      estrellasLabel: '¿Cómo calificarías nuestro servicio?',
      comentariosLabel: 'Comentarios (opcional)',
      comentariosPlaceholder: 'Comparte tu experiencia con nosotros...',
      enviar: 'Enviar Calificación',
      enviando: 'Enviando...',
      gracias: '¡Gracias por tu calificación!',
      graciasMensaje: 'Tu opinión es muy importante para nosotros.',
      volver: 'Volver al inicio',
      errorNombre: 'Por favor ingresa tu nombre',
      errorEstrellas: 'Por favor selecciona una calificación con estrellas',
      errorEnviar: 'Error al enviar la calificación. Por favor intenta nuevamente.',
      estrella: 'estrella',
      estrellas: 'estrellas',
    },
    en: {
      title: 'Rate Your Experience',
      subtitle: 'Your opinion is very important to us',
      nombreLabel: 'Your name',
      nombrePlaceholder: 'Enter your name',
      estrellasLabel: 'How would you rate our service?',
      comentariosLabel: 'Comments (optional)',
      comentariosPlaceholder: 'Share your experience with us...',
      enviar: 'Submit Rating',
      enviando: 'Submitting...',
      gracias: 'Thank you for your rating!',
      graciasMensaje: 'Your opinion is very important to us.',
      volver: 'Back to home',
      errorNombre: 'Please enter your name',
      errorEstrellas: 'Please select a star rating',
      errorEnviar: 'Error submitting rating. Please try again.',
      estrella: 'star',
      estrellas: 'stars',
    },
  };

  const text = translations[language as 'es' | 'en'] || translations.es;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nombreCliente.trim()) {
      setError(text.errorNombre);
      return;
    }

    if (estrellas === 0) {
      setError(text.errorEstrellas);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/calificaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigoReserva: null, // Ya no requerimos código
          nombreCliente: nombreCliente.trim(),
          estrellas,
          nota: nota.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || text.errorEnviar);
      }
    } catch (err) {
      setError(text.errorEnviar);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = () => {
    return (
      <div className="flex gap-2 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setEstrellas(star)}
            className={`transition-all transform hover:scale-110 ${
              star <= estrellas ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <Star
              className={`w-12 h-12 ${
                star <= estrellas ? 'fill-current' : ''
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {text.gracias}
          </h2>
          <p className="text-gray-600 mb-6">
            {text.graciasMensaje}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            {text.volver}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {text.title}
          </h1>
          <p className="text-sm text-gray-600">
            {text.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre del cliente */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              {text.nombreLabel} *
            </label>
            <input
              type="text"
              id="nombre"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
              placeholder={text.nombrePlaceholder}
              required
            />
          </div>

          {/* Estrellas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              {text.estrellasLabel} *
            </label>
            {renderStars()}
            {estrellas > 0 && (
              <p className="text-center text-sm text-gray-600 mt-2">
                {estrellas} {estrellas === 1 ? text.estrella : text.estrellas}
              </p>
            )}
          </div>

          {/* Nota */}
          <div>
            <label htmlFor="nota" className="block text-sm font-medium text-gray-700 mb-2">
              {text.comentariosLabel}
            </label>
            <textarea
              id="nota"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors resize-none"
              placeholder={text.comentariosPlaceholder}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? text.enviando : text.enviar}
          </button>
        </form>
      </motion.div>
    </div>
  );
}


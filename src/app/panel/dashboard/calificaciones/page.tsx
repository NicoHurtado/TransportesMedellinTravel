'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Calificacion {
  id: number;
  codigoReserva: string;
  nombreCliente: string;
  estrellas: number;
  nota: string | null;
  createdAt: string;
}

export default function CalificacionesPage() {
  const { t } = useLanguage();
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCalificaciones();
  }, []);

  const fetchCalificaciones = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/calificaciones');
      const data = await response.json();

      if (data.success) {
        setCalificaciones(data.data);
      }
    } catch (error) {
      console.error('Error fetching calificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCalificaciones = calificaciones.filter((cal) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      cal.nombreCliente.toLowerCase().includes(search) ||
      (cal.nota && cal.nota.toLowerCase().includes(search))
    );
  });

  const renderStars = (estrellas: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= estrellas
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const promedioEstrellas =
    calificaciones.length > 0
      ? (
          calificaciones.reduce((sum, cal) => sum + cal.estrellas, 0) /
          calificaciones.length
        ).toFixed(1)
      : '0.0';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando calificaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Calificaciones</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Opiniones y comentarios de nuestros clientes
        </p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold">{promedioEstrellas}</p>
              <p className="text-sm text-gray-600">Calificación promedio</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.round(parseFloat(promedioEstrellas))
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold">{calificaciones.length}</p>
              <p className="text-sm text-gray-600">Total de calificaciones</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-black" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {calificaciones.filter((cal) => cal.estrellas === 5).length}
              </p>
              <p className="text-sm text-gray-600">Calificaciones de 5 estrellas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre o comentario..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-colors"
        />
      </div>

      {/* Lista de calificaciones */}
      {filteredCalificaciones.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg font-medium mb-2">
            {searchTerm
              ? 'No se encontraron calificaciones'
              : 'Aún no hay calificaciones'}
          </p>
          <p className="text-sm text-gray-500">
            {searchTerm
              ? 'Intenta con otros términos de búsqueda'
              : 'Las calificaciones de tus clientes aparecerán aquí'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCalificaciones.map((calificacion) => (
            <motion.div
              key={calificacion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border-2 border-gray-200 p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {calificacion.nombreCliente}
                      </h3>
                    </div>
                    <div className="text-right">
                      {renderStars(calificacion.estrellas)}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(calificacion.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {calificacion.nota && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {calificacion.nota}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}


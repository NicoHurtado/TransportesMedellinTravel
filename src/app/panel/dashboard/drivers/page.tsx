'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';

interface Conductor {
  id: number;
  nombre: string;
  whatsapp: string;
  notasAdicionales?: string;
  activo: boolean;
  createdAt: string;
}

export default function DriversPage() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConductor, setEditingConductor] = useState<Conductor | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    notasAdicionales: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConductores();
  }, []);

  const fetchConductores = async () => {
    try {
      const response = await fetch('/api/conductores');
      const result = await response.json();
      if (result.success) {
        setConductores(result.data);
      }
    } catch (error) {
      console.error('Error fetching conductores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (conductor?: Conductor) => {
    if (conductor) {
      setEditingConductor(conductor);
      setFormData({
        nombre: conductor.nombre,
        whatsapp: conductor.whatsapp,
        notasAdicionales: conductor.notasAdicionales || '',
      });
    } else {
      setEditingConductor(null);
      setFormData({
        nombre: '',
        whatsapp: '',
        notasAdicionales: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConductor(null);
    setFormData({
      nombre: '',
      whatsapp: '',
      notasAdicionales: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingConductor
        ? `/api/conductores/${editingConductor.id}`
        : '/api/conductores';
      const method = editingConductor ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchConductores();
        handleCloseModal();
      } else {
        alert(result.error || 'Error al guardar el conductor');
      }
    } catch (error) {
      console.error('Error saving conductor:', error);
      alert('Error al guardar el conductor');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este conductor?')) {
      return;
    }

    try {
      const response = await fetch(`/api/conductores/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        await fetchConductores();
      } else {
        alert(result.error || 'Error al eliminar el conductor');
      }
    } catch (error) {
      console.error('Error deleting conductor:', error);
      alert('Error al eliminar el conductor');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">Conductores</h2>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Agregar Conductor
          </button>
        </div>
        <p className="text-gray-600">Gestión de conductores y vehículos</p>
      </div>

      {/* Conductores Grid */}
      {conductores.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">No hay conductores registrados</p>
          <button
            onClick={() => handleOpenModal()}
            className="text-black font-semibold hover:underline"
          >
            Agregar el primer conductor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {conductores
            .filter((c) => c.activo)
            .map((conductor) => (
              <motion.div
                key={conductor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-black hover:shadow-lg transition-all relative group"
              >
                {/* Avatar */}
                <div className="w-16 h-16 bg-gray-800 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                  {conductor.nombre
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>

                {/* Info */}
                <h3 className="text-lg font-semibold mb-3 pr-16">{conductor.nombre}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{conductor.whatsapp}</span>
                  </div>
                  {conductor.notasAdicionales && (
                    <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg mt-3">
                      <p className="font-medium text-gray-700 mb-1">Notas:</p>
                      <p className="line-clamp-2">{conductor.notasAdicionales}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenModal(conductor)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={() => handleDelete(conductor.id)}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mx-auto" />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      )}

      {/* Modal para Agregar/Editar Conductor */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {editingConductor ? 'Editar Conductor' : 'Agregar Conductor'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Pedro Gómez"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    placeholder="+57 300 111 2222"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Adicionales
                  </label>
                  <textarea
                    value={formData.notasAdicionales}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notasAdicionales: e.target.value,
                      })
                    }
                    placeholder="Información adicional sobre el conductor..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

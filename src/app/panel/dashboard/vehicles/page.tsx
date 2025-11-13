'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface Vehiculo {
  id: number;
  nombre: string;
  capacidadMin: number;
  capacidadMax: number;
  imagenUrl: string | null;
  tipo: string | null;
  activo: boolean;
  createdAt: Date;
}

export default function VehiclesPage() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehiculo | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    capacidadMin: '',
    capacidadMax: '',
    imagenUrl: '',
    tipo: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchVehiculos();
  }, []);

  const fetchVehiculos = async () => {
    try {
      const response = await fetch('/api/vehiculos');
      const data = await response.json();
      if (data.success) {
        setVehiculos(data.data);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, imagenUrl: data.data.url }));
      } else {
        alert('Error al subir la imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.capacidadMin || !formData.capacidadMax) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      const url = editingVehicle
        ? `/api/vehiculos/${editingVehicle.id}`
        : '/api/vehiculos';
      const method = editingVehicle ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        await fetchVehiculos();
        handleCloseModal();
        alert(editingVehicle ? 'Vehículo actualizado correctamente' : 'Vehículo creado correctamente');
      } else {
        alert('Error al guardar el vehículo');
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Error al guardar el vehículo');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (vehiculo: Vehiculo) => {
    setEditingVehicle(vehiculo);
    setFormData({
      nombre: vehiculo.nombre,
      capacidadMin: vehiculo.capacidadMin.toString(),
      capacidadMax: vehiculo.capacidadMax.toString(),
      imagenUrl: vehiculo.imagenUrl || '',
      tipo: vehiculo.tipo || '',
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este vehículo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/vehiculos/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await fetchVehiculos();
        alert(data.message || 'Vehículo eliminado correctamente');
      } else {
        alert('Error al eliminar el vehículo');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Error al eliminar el vehículo');
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingVehicle(null);
    setFormData({
      nombre: '',
      capacidadMin: '',
      capacidadMax: '',
      imagenUrl: '',
      tipo: '',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando vehículos...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Vehículos</h2>
          <p className="text-sm sm:text-base text-gray-600">Gestión de vehículos disponibles</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Vehículo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehiculos.map((vehiculo) => (
          <div
            key={vehiculo.id}
            className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-black hover:shadow-lg transition-all"
          >
            <div className="relative w-full h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
              {vehiculo.imagenUrl ? (
                <Image
                  src={vehiculo.imagenUrl}
                  alt={vehiculo.nombre}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>

            <h3 className="text-lg font-semibold mb-2">{vehiculo.nombre}</h3>
            <p className="text-sm text-gray-600 mb-4">
              Capacidad: {vehiculo.capacidadMin} - {vehiculo.capacidadMax} personas
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(vehiculo)}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => handleDelete(vehiculo.id)}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar/editar vehículo */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseModal}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">
                    {editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
                  </h2>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Vehículo *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Automóvil 3 personas"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad Mínima *
                      </label>
                      <input
                        type="number"
                        value={formData.capacidadMin}
                        onChange={(e) => setFormData({ ...formData, capacidadMin: e.target.value })}
                        placeholder="1"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                        required
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad Máxima *
                      </label>
                      <input
                        type="number"
                        value={formData.capacidadMax}
                        onChange={(e) => setFormData({ ...formData, capacidadMax: e.target.value })}
                        placeholder="3"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                        required
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo (opcional)
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="sedan">Sedan</option>
                      <option value="suv">SUV</option>
                      <option value="van">Van</option>
                      <option value="bus">Bus</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imagen (PNG)
                    </label>
                    <div className="space-y-3">
                      {formData.imagenUrl && (
                        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                          <Image
                            src={formData.imagenUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-black transition-colors">
                        <Upload className="w-5 h-5" />
                        <span>{uploadingImage ? 'Subiendo...' : 'Subir Imagen'}</span>
                        <input
                          type="file"
                          accept="image/png"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={saving || uploadingImage}
                      className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Guardando...' : editingVehicle ? 'Actualizar' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


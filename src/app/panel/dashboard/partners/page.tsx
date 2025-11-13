'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Copy, Eye, Plus, X, Edit2, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface Hotel {
  id: number;
  codigo: string;
  nombre: string;
  comisionPorcentaje: number;
  reservasEsteMes: number;
  tasaCancelacion: number;
  comisiones: Array<{
    id: number;
    servicio: string;
    vehiculoId: number;
    vehiculo?: {
      id: number;
      nombre: string;
      capacidadMin: number;
      capacidadMax: number;
      imagenUrl: string | null;
    } | null;
    comision: number;
  }>;
}

const SERVICIOS = [
  { id: 'airport-transfer', nombre: 'DESDE Y HACIA EL AEROPUERTO' },
  { id: 'guatape-tour', nombre: 'GUATAPÉ Y/O SANTA FE DE ANTIOQUIA' },
  { id: 'parapente-tour', nombre: 'PARAPENTE (TIEMPO DE ESPERA Y REGRESO)' },
  { id: 'hacienda-napoles-tour', nombre: 'HACIENDA NÁPOLES' },
  { id: 'city-tour', nombre: 'CITY TOUR' },
  { id: 'jardin-tour', nombre: 'JARDÍN ANTIOQUIA' },
  { id: 'occidente-tour', nombre: 'TOUR OCCIDENTE' },
];

interface Vehiculo {
  id: number;
  nombre: string;
  capacidadMin: number;
  capacidadMax: number;
  imagenUrl: string | null;
  tipo: string | null;
  activo: boolean;
}

export default function PartnersPage() {
  const { t } = useLanguage();
  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [nombreHotel, setNombreHotel] = useState('');
  const [tarifaCancelacion, setTarifaCancelacion] = useState<number | null>(null);
  const [comisiones, setComisiones] = useState<Record<string, Record<number, number>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchHoteles();
    fetchVehiculos();
  }, []);

  const fetchHoteles = async () => {
    try {
      const response = await fetch('/api/hoteles');
      const data = await response.json();
      if (data.success) {
        setHoteles(data.data);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiculos = async () => {
    try {
      const response = await fetch('/api/vehiculos');
      const data = await response.json();
      if (data.success) {
        setVehiculos(data.data.filter((v: Vehiculo) => v.activo));
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleCopyCode = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    // TODO: Mostrar notificación de copiado
  };

  const handleAddHotel = async () => {
    if (!nombreHotel.trim()) return;

    // Convertir comisiones al formato esperado
    const comisionesArray = [];
    for (const [servicio, vehiculosData] of Object.entries(comisiones)) {
      for (const [vehiculoId, comision] of Object.entries(vehiculosData)) {
        if (comision > 0) {
          comisionesArray.push({
            servicio,
            vehiculoId: parseInt(vehiculoId),
            comision,
          });
        }
      }
    }

    try {
      const response = await fetch('/api/hoteles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreHotel.trim(),
          tarifaCancelacion: tarifaCancelacion || null,
          comisiones: comisionesArray,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchHoteles();
        setShowAddModal(false);
        setNombreHotel('');
        setTarifaCancelacion(null);
        setComisiones({});
      }
    } catch (error) {
      console.error('Error creating hotel:', error);
    }
  };

  const updateComision = (servicio: string, vehiculoId: number, valor: number | string) => {
    // Si el valor es una cadena vacía, establecerlo como undefined para que no se guarde
    // Si es un número válido (incluyendo 0), guardarlo
    const numValue = valor === '' || valor === null || valor === undefined 
      ? undefined 
      : (typeof valor === 'number' ? valor : parseFloat(valor as string));
    
    setComisiones((prev) => {
      const newComisiones = { ...prev };
      if (!newComisiones[servicio]) {
        newComisiones[servicio] = {};
      }
      
      if (numValue === undefined || isNaN(numValue)) {
        // Si el valor es inválido o vacío, eliminar la comisión
        const { [vehiculoId]: removed, ...rest } = newComisiones[servicio];
        newComisiones[servicio] = rest;
        // Si el servicio no tiene más comisiones, eliminarlo también
        if (Object.keys(newComisiones[servicio]).length === 0) {
          const { [servicio]: removedServicio, ...restServicios } = newComisiones;
          return restServicios;
        }
      } else {
        // Guardar el valor (incluyendo 0)
        newComisiones[servicio] = {
          ...newComisiones[servicio],
          [vehiculoId]: numValue,
        };
      }
      
      return newComisiones;
    });
  };

  const handleViewHotel = async (hotel: Hotel) => {
    try {
      const response = await fetch(`/api/hoteles/${hotel.id}`);
      const data = await response.json();
      if (data.success) {
        setSelectedHotel(data.data);
        setNombreHotel(data.data.nombre);
        const tarifaValue = data.data.tarifaCancelacion !== null && data.data.tarifaCancelacion !== undefined 
          ? Number(data.data.tarifaCancelacion) 
          : null;
        console.log('📥 TarifaCancelacion recibida del servidor:', data.data.tarifaCancelacion, '→ parseada:', tarifaValue);
        setTarifaCancelacion(tarifaValue);
        
        // Cargar comisiones existentes
        console.log('📥 Comisiones recibidas del servidor:', data.data.comisiones);
        const comisionesData: Record<string, Record<number, number>> = {};
        data.data.comisiones.forEach((c: any) => {
          if (!comisionesData[c.servicio]) {
            comisionesData[c.servicio] = {};
          }
          const comisionValue = typeof c.comision === 'number' ? c.comision : Number(c.comision);
          console.log(`📋 Cargando comisión: servicio=${c.servicio}, vehiculoId=${c.vehiculoId}, comision=${comisionValue}`);
          comisionesData[c.servicio][c.vehiculoId] = comisionValue;
        });
        console.log('📊 Comisiones cargadas en estado:', comisionesData);
        setComisiones(comisionesData);
        
        setShowEditModal(true);
      }
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      alert('Error al cargar los detalles del hotel');
    }
  };

  const handleUpdateHotel = async () => {
    if (!selectedHotel || !nombreHotel.trim()) return;

    setIsSaving(true);
    try {
      // Convertir comisiones al formato esperado
      const comisionesArray = [];
      for (const [servicio, vehiculosData] of Object.entries(comisiones)) {
        for (const [vehiculoId, comision] of Object.entries(vehiculosData)) {
          // Guardar todas las comisiones que tengan un valor numérico válido (incluyendo 0)
          // Solo excluir valores undefined, null o NaN
          if (comision !== undefined && comision !== null) {
            const comisionValue = typeof comision === 'number' ? comision : parseFloat(comision as any);
            if (!isNaN(comisionValue) && comisionValue >= 0) {
              comisionesArray.push({
                servicio,
                vehiculoId: parseInt(vehiculoId),
                comision: comisionValue,
              });
            }
          }
        }
      }
      
      console.log('📤 Enviando comisiones:', comisionesArray);
      console.log('📤 Estado de comisiones antes de enviar:', comisiones);

      console.log('📤 Enviando tarifaCancelacion:', tarifaCancelacion);
      
      const response = await fetch(`/api/hoteles/${selectedHotel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombreHotel.trim(),
          tarifaCancelacion: tarifaCancelacion !== null && tarifaCancelacion !== undefined ? tarifaCancelacion : null,
          comisiones: comisionesArray,
        }),
      });

      const data = await response.json();
      if (data.success) {
        console.log('✅ Hotel actualizado correctamente, respuesta:', data);
        // Recargar los datos del hotel para mostrar los valores guardados
        await handleViewHotel({ id: selectedHotel.id } as Hotel);
        await fetchHoteles();
        alert('Hotel actualizado correctamente');
      } else {
        console.error('❌ Error al actualizar el hotel:', data);
        const errorMessage = data.error || 'Error desconocido';
        const errorDetails = data.details ? `\n\nDetalles: ${data.details}` : '';
        alert(`Error al actualizar el hotel: ${errorMessage}${errorDetails}`);
      }
    } catch (error) {
      console.error('Error updating hotel:', error);
      alert('Error al actualizar el hotel');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHotel = async () => {
    if (!selectedHotel) return;

    if (!confirm(`¿Estás seguro de que quieres eliminar el hotel "${selectedHotel.nombre}"?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/hoteles/${selectedHotel.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        await fetchHoteles();
        setShowEditModal(false);
        setSelectedHotel(null);
        setNombreHotel('');
        setTarifaCancelacion(null);
        setComisiones({});
        alert('Hotel eliminado correctamente');
      } else {
        alert('Error al eliminar el hotel');
      }
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Error al eliminar el hotel');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Cargando hoteles...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('partners')}</h2>
          <p className="text-sm sm:text-base text-gray-600">Hoteles aliados</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center gap-2 min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Hotel</span>
        </button>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {hoteles.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 hover:border-black hover:shadow-lg transition-all"
          >
            <div className="flex flex-col lg:flex-row items-start gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                🏨
              </div>

              <div className="flex-1 min-w-0 w-full">
                <h3 className="text-lg sm:text-xl font-semibold mb-1 truncate">{hotel.nombre}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3">Medellín</p>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Reservas este mes</p>
                    <p className="text-xl sm:text-2xl font-bold">{hotel.reservasEsteMes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Tasa de cancelación</p>
                    <p className="text-xl sm:text-2xl font-bold">{hotel.tasaCancelacion}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-xl">
                  <code className="flex-1 text-xs sm:text-sm font-mono truncate">{hotel.codigo}</code>
                  <button
                    onClick={() => handleCopyCode(hotel.codigo)}
                    className="p-2 hover:bg-gray-200 rounded-lg flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex sm:flex-col gap-2 flex-shrink-0 w-full sm:w-auto">
                <button 
                  onClick={() => handleViewHotel(hotel)}
                  className="flex-1 sm:flex-none px-4 py-2 bg-black text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-800 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="sm:hidden">Ver detalles</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para agregar hotel */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold">Agregar Hotel</h2>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Hotel
                    </label>
                    <input
                      type="text"
                      value={nombreHotel}
                      onChange={(e) => setNombreHotel(e.target.value)}
                      placeholder="Ej: Hotel Poblado Plaza"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El código se generará automáticamente
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarifa de Cancelación (COP)
                    </label>
                    <input
                      type="number"
                      value={tarifaCancelacion !== null && tarifaCancelacion !== undefined ? tarifaCancelacion : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === null) {
                          setTarifaCancelacion(null);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            setTarifaCancelacion(numValue);
                          }
                        }
                      }}
                      placeholder="Ej: 50000 (dejar vacío si no aplica)"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tarifa que se aplicará si se cancela dentro de las 24 horas antes del servicio. Dejar vacío si no aplica tarifa de cancelación.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Comisiones por Servicio y Vehículo</h3>
                    <div className="space-y-6">
                      {SERVICIOS.map((servicio) => (
                        <div key={servicio.id} className="border-2 border-gray-200 rounded-xl p-4">
                          <h4 className="font-semibold mb-3">{servicio.nombre}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {vehiculos.length > 0 ? (
                              vehiculos.map((vehiculo) => (
                                <div key={vehiculo.id} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    {vehiculo.imagenUrl && (
                                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                        <Image
                                          src={vehiculo.imagenUrl}
                                          alt={vehiculo.nombre}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <label className="block text-xs font-semibold text-gray-900 truncate">
                                        {vehiculo.nombre}
                                      </label>
                                      <p className="text-xs text-gray-500">
                                        {vehiculo.capacidadMin} - {vehiculo.capacidadMax} personas
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">$</span>
                                    <input
                                      type="number"
                                      value={
                                        comisiones[servicio.id]?.[vehiculo.id] !== undefined && comisiones[servicio.id][vehiculo.id] !== null
                                          ? comisiones[servicio.id][vehiculo.id]
                                          : ''
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Si está vacío, pasar cadena vacía; si tiene valor, parsear
                                        if (value === '') {
                                          updateComision(servicio.id, vehiculo.id, '');
                                        } else {
                                          const numValue = parseFloat(value);
                                          if (!isNaN(numValue)) {
                                            updateComision(servicio.id, vehiculo.id, numValue);
                                          }
                                        }
                                      }}
                                      placeholder="0"
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black transition-colors text-sm"
                                    />
                                    <span className="text-xs text-gray-500">COP</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full p-4 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <p className="text-sm text-gray-500">
                                  No hay vehículos disponibles. Agrega vehículos en la sección "Vehículos" primero.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddHotel}
                      disabled={!nombreHotel.trim()}
                      className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Agregar Hotel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Modal para ver/editar hotel */}
      <AnimatePresence>
        {showEditModal && selectedHotel && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => {
                setShowEditModal(false);
                setSelectedHotel(null);
                setNombreHotel('');
                setComisiones({});
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            >
              <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-semibold">Detalles del Hotel</h2>
                    <p className="text-sm text-gray-600 mt-1">Código: {selectedHotel.codigo}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedHotel(null);
                      setNombreHotel('');
                      setComisiones({});
                    }}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Hotel
                    </label>
                    <input
                      type="text"
                      value={nombreHotel}
                      onChange={(e) => setNombreHotel(e.target.value)}
                      placeholder="Ej: Hotel Poblado Plaza"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarifa de Cancelación (COP)
                    </label>
                    <input
                      type="number"
                      value={tarifaCancelacion !== null && tarifaCancelacion !== undefined ? tarifaCancelacion : ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || value === null) {
                          setTarifaCancelacion(null);
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue)) {
                            setTarifaCancelacion(numValue);
                          }
                        }
                      }}
                      placeholder="Ej: 50000 (dejar vacío si no aplica)"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black transition-colors"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Tarifa que se aplicará si se cancela dentro de las 24 horas antes del servicio. Dejar vacío si no aplica tarifa de cancelación.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Comisiones por Servicio y Vehículo</h3>
                    <div className="space-y-6">
                      {SERVICIOS.map((servicio) => (
                        <div key={servicio.id} className="border-2 border-gray-200 rounded-xl p-4">
                          <h4 className="font-semibold mb-3">{servicio.nombre}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {vehiculos.length > 0 ? (
                              vehiculos.map((vehiculo) => (
                                <div key={vehiculo.id} className="border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    {vehiculo.imagenUrl && (
                                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                                        <Image
                                          src={vehiculo.imagenUrl}
                                          alt={vehiculo.nombre}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <label className="block text-xs font-semibold text-gray-900 truncate">
                                        {vehiculo.nombre}
                                      </label>
                                      <p className="text-xs text-gray-500">
                                        {vehiculo.capacidadMin} - {vehiculo.capacidadMax} personas
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm">$</span>
                                    <input
                                      type="number"
                                      value={
                                        comisiones[servicio.id]?.[vehiculo.id] !== undefined && comisiones[servicio.id][vehiculo.id] !== null
                                          ? comisiones[servicio.id][vehiculo.id]
                                          : ''
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value;
                                        // Si está vacío, pasar cadena vacía; si tiene valor, parsear
                                        if (value === '') {
                                          updateComision(servicio.id, vehiculo.id, '');
                                        } else {
                                          const numValue = parseFloat(value);
                                          if (!isNaN(numValue)) {
                                            updateComision(servicio.id, vehiculo.id, numValue);
                                          }
                                        }
                                      }}
                                      placeholder="0"
                                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-black transition-colors text-sm"
                                    />
                                    <span className="text-xs text-gray-500">COP</span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="col-span-full p-4 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <p className="text-sm text-gray-500">
                                  No hay vehículos disponibles. Agrega vehículos en la sección "Vehículos" primero.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                    <button
                      onClick={handleDeleteHotel}
                      disabled={isDeleting}
                      className="px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Eliminando...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          <span>Eliminar Hotel</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowEditModal(false);
                        setSelectedHotel(null);
                        setNombreHotel('');
                        setComisiones({});
                      }}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleUpdateHotel}
                      disabled={!nombreHotel.trim() || isSaving}
                      className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Edit2 className="w-4 h-4" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  DollarSign,
  Car,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Users,
  Utensils,
  Ship,
  User,
  Check,
  Loader2,
  MapPin,
} from 'lucide-react';
import AddServiceModal from '@/components/Dashboard/AddServiceModal';

interface Servicio {
  id: number;
  codigo: string;
  nombreEs: string;
  nombreEn: string;
  descripcionCortaEs: string | null;
  descripcionCortaEn: string | null;
  descripcionCompletaEs: string | null;
  descripcionCompletaEn: string | null;
  imagenUrl: string | null;
  tipo: string;
  tablaReservas: string;
  activo: boolean;
  ordenDisplay: number;
  configuracion: any;
}

interface Vehiculo {
  id: number;
  nombre: string;
  capacidadMin: number;
  capacidadMax: number;
  imagenUrl: string | null;
  tipo: string | null;
  activo: boolean;
}

interface PrecioVehiculo {
  id: number;
  vehiculoId: number;
  pasajerosMin?: number;
  pasajerosMax?: number;
  precio: any;
  vigenteDesde: Date;
  vigenteHasta?: Date | null;
  activo: boolean;
}

interface PrecioAdicional {
  id: number;
  tipo: string;
  rango?: string | null;
  precio: any;
  vigenteDesde: Date;
  vigenteHasta?: Date | null;
  activo: boolean;
}

interface Hotel {
  id: number;
  codigo: string;
  nombre: string;
}

export default function ServicesPage() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [precios, setPrecios] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<number | null>(null);
  const [editedService, setEditedService] = useState<Partial<Servicio>>({});
  const [expandedService, setExpandedService] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingPrices, setEditingPrices] = useState<Record<number, string>>({});
  const [savingPrices, setSavingPrices] = useState<Record<number, boolean>>({});
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [vehiclePrices, setVehiclePrices] = useState<Record<number, string>>({});
  const [addingVehicles, setAddingVehicles] = useState<Record<number, boolean>>({});
  
  // Estados para servicios activos por hotel
  const [hoteles, setHoteles] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [serviciosActivosPorHotel, setServiciosActivosPorHotel] = useState<Record<number, Set<number>>>({});
  const [savingServiciosActivos, setSavingServiciosActivos] = useState(false);

  useEffect(() => {
    fetchData();
    fetchHoteles();
  }, []);

  const fetchHoteles = async () => {
    try {
      const response = await fetch('/api/hoteles');
      const data = await response.json();
      if (data.success) {
        const hotelesData = data.data.map((h: any) => ({ id: h.id, codigo: h.codigo, nombre: h.nombre }));
        console.log('📥 Hoteles cargados:', hotelesData.length);
        setHoteles(hotelesData);
        
        // Cargar servicios activos para todos los hoteles
        for (const hotel of hotelesData) {
          await fetchServiciosActivos(hotel.id);
        }
      } else {
        console.error('❌ Error al cargar hoteles:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching hoteles:', error);
    }
  };

  const fetchServiciosActivos = async (hotelId: number) => {
    try {
      const response = await fetch(`/api/hoteles/${hotelId}/servicios-activos`);
      const data = await response.json();
      if (data.success) {
        const activosSet = new Set<number>(data.data.filter((sa: any) => sa.activo).map((sa: any) => Number(sa.servicioId)));
        console.log(`📥 Servicios activos para hotel ${hotelId}:`, Array.from(activosSet));
        setServiciosActivosPorHotel((prev) => ({
          ...prev,
          [hotelId]: activosSet,
        }));
      } else {
        console.error(`❌ Error al cargar servicios activos para hotel ${hotelId}:`, data.error);
      }
    } catch (error) {
      console.error(`❌ Error fetching servicios activos para hotel ${hotelId}:`, error);
    }
  };

  const handleToggleServicioActivo = async (hotelId: number, servicioId: number) => {
    const currentActivos = serviciosActivosPorHotel[hotelId] || new Set<number>();
    const nuevoEstado = !currentActivos.has(servicioId);
    
    // Actualizar estado local inmediatamente
    const nuevosActivos = new Set(currentActivos);
    if (nuevoEstado) {
      nuevosActivos.add(servicioId);
    } else {
      nuevosActivos.delete(servicioId);
    }
    
    setServiciosActivosPorHotel((prev) => ({
      ...prev,
      [hotelId]: nuevosActivos,
    }));

    // Guardar en el servidor
    setSavingServiciosActivos(true);
    try {
      const serviciosActivosArray = servicios.map((s) => ({
        servicioId: s.id,
        activo: nuevosActivos.has(s.id),
      }));

      const response = await fetch(`/api/hoteles/${hotelId}/servicios-activos`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviciosActivos: serviciosActivosArray,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        // Revertir cambio si falla
        setServiciosActivosPorHotel((prev) => ({
          ...prev,
          [hotelId]: currentActivos,
        }));
        alert('Error al actualizar el servicio activo');
      }
    } catch (error) {
      console.error('Error updating servicio activo:', error);
      // Revertir cambio si falla
      setServiciosActivosPorHotel((prev) => ({
        ...prev,
        [hotelId]: currentActivos,
      }));
      alert('Error al actualizar el servicio activo');
    } finally {
      setSavingServiciosActivos(false);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('/api/services');
      const data = await response.json();

      if (data.success) {
        setServicios(data.data.servicios);
        setVehiculos(data.data.vehiculos);
        setPrecios(data.data.precios);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingService(servicio.id);
    setEditedService({
      ...servicio,
      configuracion: servicio.configuracion || {},
    });
  };

  const handleCancel = () => {
    setEditingService(null);
    setEditedService({});
    setVehiclePrices({});
    setAddingVehicles({});
  };

  const handleSave = async () => {
    if (!editingService) return;

    setSaving(true);
    try {
      // Limpiar campos vacíos de incluye y noIncluye antes de guardar
      const cleanedConfig = { ...editedService.configuracion };
      if (cleanedConfig.incluye) {
        cleanedConfig.incluye = cleanedConfig.incluye.filter((item: string) => item.trim() !== '');
      }
      if (cleanedConfig.noIncluye) {
        cleanedConfig.noIncluye = cleanedConfig.noIncluye.filter((item: string) => item.trim() !== '');
      }
      if (cleanedConfig.camposPersonalizados) {
        cleanedConfig.camposPersonalizados = cleanedConfig.camposPersonalizados.filter((campo: any) => campo.label && campo.label.trim() !== '');
      }

      const serviceToSave = {
        ...editedService,
        configuracion: cleanedConfig,
      };

      const response = await fetch(`/api/services/${editingService}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceToSave),
      });

      const data = await response.json();

      if (data.success) {
        setServicios((prevServicios) =>
          prevServicios.map((s) =>
            s.id === editingService ? { ...s, ...editedService } : s
          )
        );
        setEditingService(null);
        setEditedService({});
        alert('✅ Servicio actualizado correctamente');
      } else {
        alert('❌ Error al actualizar el servicio');
      }
    } catch (error) {
      console.error('Error saving service:', error);
      alert('❌ Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (servicioId: number, servicioNombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres ELIMINAR DEFINITIVAMENTE el servicio "${servicioNombre}"?\n\n⚠️ Esta acción NO se puede deshacer. El servicio será borrado permanentemente de la base de datos.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${servicioId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Remover el servicio de la lista
        setServicios((prevServicios) =>
          prevServicios.filter((s) => s.id !== servicioId)
        );
        alert('✅ Servicio eliminado exitosamente');
      } else {
        alert('❌ Error al eliminar el servicio: ' + (data.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('❌ Error al eliminar el servicio');
    }
  };

  const handleToggleActive = async (servicioId: number, currentActive: boolean) => {
    if (!confirm(`¿Estás seguro de que quieres ${currentActive ? 'ocultar' : 'mostrar'} este servicio?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${servicioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: !currentActive }),
      });

      const data = await response.json();

      if (data.success) {
        setServicios((prevServicios) =>
          prevServicios.map((s) =>
            s.id === servicioId ? { ...s, activo: !currentActive } : s
          )
        );
        alert(`✅ Servicio ${!currentActive ? 'activado' : 'desactivado'} correctamente`);
      } else {
        alert('❌ Error al actualizar el servicio');
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      alert('❌ Error al actualizar el estado del servicio');
    }
  };

  const handleChange = (field: keyof Servicio, value: any) => {
    setEditedService((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleExpand = (servicioId: number) => {
    setExpandedService(expandedService === servicioId ? null : servicioId);
  };

  const getPreciosByServicio = (codigo: string, servicio?: Servicio) => {
    const tipoMap: Record<string, string> = {
      'airport-transfer': 'airport',
      'guatape-tour': 'guatapeVehiculos',
      'city-tour': 'cityTour',
      'graffiti-tour': 'graffiti',
      'hacienda-napoles-tour': 'haciendaNapoles',
      'occidente-tour': 'occidente',
      'parapente-tour': 'parapente',
      'atv-tour': 'atv',
      'jardin-tour': 'jardin',
      'coffee-farm-tour': 'coffeeFarm',
    };

    const key = tipoMap[codigo];
    if (key && precios[key]) {
      return precios[key] || [];
    }
    
    // Si no está en el mapeo, buscar en precios dinámicos
    if (precios.dinamicos && precios.dinamicos[codigo]) {
      return precios.dinamicos[codigo] || [];
    }
    
    // También buscar en configuración del servicio
    if (servicio?.configuracion?.preciosVehiculos) {
      return servicio.configuracion.preciosVehiculos.map((p: any) => ({
        id: p.vehiculoId, // Usar vehiculoId como ID temporal
        vehiculoId: p.vehiculoId,
        pasajerosMin: p.pasajerosMin,
        pasajerosMax: p.pasajerosMax,
        precio: p.precio,
        activo: true,
      }));
    }
    
    return [];
  };

  const getAdditionalPrices = (codigo: string) => {
    if (codigo === 'guatape-tour') {
      return precios.guatapeAdicionales || [];
    }
    return [];
  };

  const handlePriceChange = (precioId: number, newValue: string) => {
    setEditingPrices((prev) => ({
      ...prev,
      [precioId]: newValue,
    }));
  };

  const savePriceChange = async (serviceCodigo: string, precioId: number, isAdditional: boolean = false) => {
    const newPrice = editingPrices[precioId];
    if (!newPrice || isNaN(Number(newPrice))) {
      alert('❌ Por favor ingresa un precio válido');
      return;
    }

    setSavingPrices((prev) => ({ ...prev, [precioId]: true }));

    try {
      const endpoint = isAdditional ? '/api/precios/adicionales' : '/api/precios/vehiculos';
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceCodigo,
          precioId,
          precio: Number(newPrice),
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar el precio localmente
        fetchData(); // Refrescar todos los datos
        setEditingPrices((prev) => {
          const newState = { ...prev };
          delete newState[precioId];
          return newState;
        });
        alert('✅ Precio actualizado correctamente');
      } else {
        alert('❌ Error al actualizar el precio');
      }
    } catch (error) {
      console.error('Error saving price:', error);
      alert('❌ Error al guardar el precio');
    } finally {
      setSavingPrices((prev) => ({ ...prev, [precioId]: false }));
    }
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(Number(price));
  };

  const getAdditionalPriceLabel = (tipo: string, rango?: string | null) => {
    const labels: Record<string, string> = {
      bote: '🚤 Paseo en Bote',
      almuerzo: '🍽️ Almuerzo',
      guia_espanol: '👤 Guía Español',
      guia_ingles: '👤 Guía Inglés',
    };
    const label = labels[tipo] || tipo;
    return rango ? `${label} (${rango})` : label;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8" />
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Servicios
              </h1>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Agregar Servicio
            </button>
          </div>
          <p className="text-gray-600">
            Edita descripciones, precios de vehículos, precios de extras y toda la información de cada servicio
          </p>
        </div>

        {/* Servicios List */}
        <div className="space-y-4">
          {servicios.map((servicio) => {
            const isEditing = editingService === servicio.id;
            const isExpanded = expandedService === servicio.id;
            const servicioPrecios = getPreciosByServicio(servicio.codigo, servicio);
            const preciosAdicionales = getAdditionalPrices(servicio.codigo);
            const configuracion = servicio.configuracion || {};

            return (
              <motion.div
                key={servicio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                {/* Service Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {servicio.imagenUrl && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shadow-md">
                          <img
                            src={servicio.imagenUrl}
                            alt={servicio.nombreEs}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {servicio.nombreEs}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                          {servicio.nombreEn}
                        </p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          📋 {servicio.codigo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(servicio.id, servicio.activo)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all hover:shadow-md ${
                          servicio.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title={servicio.activo ? 'Click para ocultar' : 'Click para mostrar'}
                      >
                        {servicio.activo ? '✓ Activo' : '✗ Inactivo'}
                      </button>

                      {!isEditing && (
                        <>
                          <button
                            onClick={() => handleEdit(servicio)}
                            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Editar servicio"
                          >
                            <Edit2 className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(servicio.id, servicio.nombreEs)}
                            className="p-3 hover:bg-red-50 rounded-xl transition-colors"
                            title="Eliminar servicio"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </button>
                        </>
                      )}

                      {isEditing && (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-3 hover:bg-green-100 rounded-xl transition-colors text-green-600 disabled:opacity-50"
                            title="Guardar cambios"
                          >
                            {saving ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Save className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-3 hover:bg-red-100 rounded-xl transition-colors text-red-600"
                            title="Cancelar edición"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => toggleExpand(servicio.id)}
                        className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                        title={isExpanded ? 'Colapsar' : 'Expandir'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Service Details - Expandable */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 space-y-8">
                        {/* Descripciones */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            📝 Descripciones
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                🇪🇸 Descripción Corta (Español)
                              </label>
                              {isEditing ? (
                                <textarea
                                  value={editedService.descripcionCortaEs || ''}
                                  onChange={(e) =>
                                    handleChange('descripcionCortaEs', e.target.value)
                                  }
                                  rows={3}
                                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                                  placeholder="Ingresa una descripción corta en español..."
                                />
                              ) : (
                                <p className="text-gray-600 whitespace-pre-wrap p-4 bg-gray-50 rounded-xl">
                                  {servicio.descripcionCortaEs || 'No especificada'}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                🇺🇸 Descripción Corta (Inglés)
                              </label>
                              {isEditing ? (
                                <textarea
                                  value={editedService.descripcionCortaEn || ''}
                                  onChange={(e) =>
                                    handleChange('descripcionCortaEn', e.target.value)
                                  }
                                  rows={3}
                                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                                  placeholder="Enter a short description in English..."
                                />
                              ) : (
                                <p className="text-gray-600 whitespace-pre-wrap p-4 bg-gray-50 rounded-xl">
                                  {servicio.descripcionCortaEn || 'Not specified'}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                🇪🇸 Descripción Completa (Español)
                              </label>
                              {isEditing ? (
                                <textarea
                                  value={editedService.descripcionCompletaEs || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'descripcionCompletaEs',
                                      e.target.value
                                    )
                                  }
                                  rows={5}
                                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                                  placeholder="Ingresa la descripción completa en español..."
                                />
                              ) : (
                                <p className="text-gray-600 whitespace-pre-wrap p-4 bg-gray-50 rounded-xl">
                                  {servicio.descripcionCompletaEs ||
                                    'No especificada'}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                🇺🇸 Descripción Completa (Inglés)
                              </label>
                              {isEditing ? (
                                <textarea
                                  value={editedService.descripcionCompletaEn || ''}
                                  onChange={(e) =>
                                    handleChange(
                                      'descripcionCompletaEn',
                                      e.target.value
                                    )
                                  }
                                  rows={5}
                                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black transition-all"
                                  placeholder="Enter the complete description in English..."
                                />
                              ) : (
                                <p className="text-gray-600 whitespace-pre-wrap p-4 bg-gray-50 rounded-xl">
                                  {servicio.descripcionCompletaEn ||
                                    'Not specified'}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vehículos Disponibles y Precios */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Car className="w-6 h-6" />
                            Vehículos Disponibles y Precios
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Selecciona los vehículos disponibles para este servicio y asigna un precio a cada uno. Solo los vehículos con precio asignado estarán disponibles para los clientes.
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vehiculos
                              .filter((v) => v.activo)
                              .map((vehiculo) => {
                                const existingPrice = servicioPrecios.find(
                                  (p: PrecioVehiculo) => p.vehiculoId === vehiculo.id && p.activo
                                );
                                const isEditingPrice = existingPrice && editingPrices[existingPrice.id] !== undefined;
                                const isSaving = existingPrice && savingPrices[existingPrice.id];
                                const localPrice = vehiclePrices[vehiculo.id] || existingPrice?.precio?.toString() || '';
                                const isAdding = addingVehicles[vehiculo.id] || false;

                                const handleAddOrUpdateVehicle = async () => {
                                  const price = vehiclePrices[vehiculo.id] || existingPrice?.precio?.toString();
                                  if (!price || isNaN(Number(price))) {
                                    alert('Por favor ingresa un precio válido');
                                    return;
                                  }

                                  if (existingPrice) {
                                    // Actualizar precio existente
                                    setSavingPrices((prev) => ({ ...prev, [existingPrice.id]: true }));
                                    try {
                                      const response = await fetch('/api/precios/vehiculos', {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          serviceCodigo: servicio.codigo,
                                          precioId: existingPrice.id,
                                          precio: Number(price),
                                        }),
                                      });

                                      const data = await response.json();
                                      if (data.success) {
                                        await fetchData();
                                        setVehiclePrices((prev) => {
                                          const newState = { ...prev };
                                          delete newState[vehiculo.id];
                                          return newState;
                                        });
                                        setEditingPrices((prev) => {
                                          const newState = { ...prev };
                                          delete newState[existingPrice.id];
                                          return newState;
                                        });
                                        alert('Precio actualizado correctamente');
                                      } else {
                                        alert('Error al actualizar el precio');
                                      }
                                    } catch (error) {
                                      console.error('Error updating price:', error);
                                      alert('Error al actualizar el precio');
                                    } finally {
                                      setSavingPrices((prev) => {
                                        const newState = { ...prev };
                                        delete newState[existingPrice.id];
                                        return newState;
                                      });
                                    }
                                  } else {
                                    // Agregar nuevo vehículo
                                    setAddingVehicles((prev) => ({ ...prev, [vehiculo.id]: true }));
                                    try {
                                      const response = await fetch('/api/precios/vehiculos', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          serviceCodigo: servicio.codigo,
                                          vehiculoId: vehiculo.id,
                                          pasajerosMin: vehiculo.capacidadMin,
                                          pasajerosMax: vehiculo.capacidadMax,
                                          precio: Number(price),
                                        }),
                                      });

                                      const data = await response.json();
                                      if (data.success) {
                                        await fetchData();
                                        setVehiclePrices((prev) => {
                                          const newState = { ...prev };
                                          delete newState[vehiculo.id];
                                          return newState;
                                        });
                                        alert('Vehículo agregado correctamente');
                                      } else {
                                        alert('Error al agregar el vehículo');
                                      }
                                    } catch (error) {
                                      console.error('Error adding vehicle:', error);
                                      alert('Error al agregar el vehículo');
                                    } finally {
                                      setAddingVehicles((prev) => {
                                        const newState = { ...prev };
                                        delete newState[vehiculo.id];
                                        return newState;
                                      });
                                    }
                                  }
                                };

                                return (
                                  <div
                                    key={vehiculo.id}
                                    className={`p-5 border-2 rounded-xl transition-all ${
                                      existingPrice
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3 mb-3">
                                      {vehiculo.imagenUrl && (
                                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                          <img
                                            src={vehiculo.imagenUrl}
                                            alt={vehiculo.nombre}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-900 text-sm truncate">
                                          {vehiculo.nombre}
                                        </p>
                                        <p className="text-xs text-gray-600">
                                          {vehiculo.capacidadMin} - {vehiculo.capacidadMax} personas
                                        </p>
                                      </div>
                                    </div>

                                    {existingPrice ? (
                                      <div className="space-y-2">
                                        {isEditingPrice ? (
                                          <div className="space-y-2">
                                            <input
                                              type="number"
                                              value={editingPrices[existingPrice.id]}
                                              onChange={(e) => {
                                                setEditingPrices((prev) => ({
                                                  ...prev,
                                                  [existingPrice.id]: e.target.value,
                                                }));
                                              }}
                                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                                              placeholder="Nuevo precio"
                                              disabled={isSaving}
                                            />
                                            <div className="flex gap-2">
                                              <button
                                                onClick={async () => {
                                                  const newPrice = editingPrices[existingPrice.id];
                                                  if (!newPrice || isNaN(Number(newPrice))) {
                                                    alert('Por favor ingresa un precio válido');
                                                    return;
                                                  }
                                                  setSavingPrices((prev) => ({ ...prev, [existingPrice.id]: true }));
                                                  try {
                                                    const response = await fetch('/api/precios/vehiculos', {
                                                      method: 'PUT',
                                                      headers: {
                                                        'Content-Type': 'application/json',
                                                      },
                                                      body: JSON.stringify({
                                                        serviceCodigo: servicio.codigo,
                                                        precioId: existingPrice.id,
                                                        precio: Number(newPrice),
                                                      }),
                                                    });
                                                    const data = await response.json();
                                                    if (data.success) {
                                                      await fetchData();
                                                      setEditingPrices((prev) => {
                                                        const newState = { ...prev };
                                                        delete newState[existingPrice.id];
                                                        return newState;
                                                      });
                                                      alert('Precio actualizado correctamente');
                                                    } else {
                                                      alert('Error al actualizar el precio');
                                                    }
                                                  } catch (error) {
                                                    console.error('Error updating price:', error);
                                                    alert('Error al actualizar el precio');
                                                  } finally {
                                                    setSavingPrices((prev) => {
                                                      const newState = { ...prev };
                                                      delete newState[existingPrice.id];
                                                      return newState;
                                                    });
                                                  }
                                                }}
                                                disabled={isSaving}
                                                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                                              >
                                                {isSaving ? (
                                                  <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    <span>Guardando...</span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Check className="w-4 h-4" />
                                                    <span>Guardar</span>
                                                  </>
                                                )}
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setEditingPrices((prev) => {
                                                    const newState = { ...prev };
                                                    delete newState[existingPrice.id];
                                                    return newState;
                                                  });
                                                }}
                                                disabled={isSaving}
                                                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                              >
                                                <X className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex items-center justify-between">
                                              <span className="text-sm text-gray-600">Precio:</span>
                                              <span className="text-lg font-bold text-green-700">
                                                {formatPrice(existingPrice.precio)}
                                              </span>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => {
                                                  setEditingPrices((prev) => ({
                                                    ...prev,
                                                    [existingPrice.id]: existingPrice.precio.toString(),
                                                  }));
                                                }}
                                                className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
                                              >
                                                <Edit2 className="w-4 h-4" />
                                                <span>Editar Precio</span>
                                              </button>
                                              <button
                                                onClick={async () => {
                                                  if (
                                                    confirm(
                                                      '¿Estás seguro de que quieres eliminar este vehículo del servicio?'
                                                    )
                                                  ) {
                                                    try {
                                                      const response = await fetch(
                                                        `/api/precios/vehiculos?serviceCodigo=${servicio.codigo}&precioId=${existingPrice.id}`,
                                                        {
                                                          method: 'DELETE',
                                                        }
                                                      );
                                                      const data = await response.json();
                                                      if (data.success) {
                                                        await fetchData();
                                                        alert('Vehículo eliminado del servicio');
                                                      }
                                                    } catch (error) {
                                                      console.error('Error removing vehicle:', error);
                                                    }
                                                  }
                                                }}
                                                className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        <input
                                          type="number"
                                          value={localPrice}
                                          onChange={(e) => setVehiclePrices((prev) => ({ ...prev, [vehiculo.id]: e.target.value }))}
                                          placeholder="Precio en COP"
                                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                                          disabled={isAdding}
                                        />
                                        <button
                                          onClick={handleAddOrUpdateVehicle}
                                          disabled={isAdding || !localPrice}
                                          className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                        >
                                          {isAdding ? (
                                            <>
                                              <Loader2 className="w-4 h-4 animate-spin" />
                                              <span>Agregando...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Plus className="w-4 h-4" />
                                              <span>Agregar al Servicio</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </div>

                        {/* Sección removida - ahora todo está en "Vehículos Disponibles y Precios" */}
                        {false && (
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <Plus className="w-6 h-6" />
                              Seleccionar Vehículos Disponibles
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Selecciona los vehículos disponibles para este tour y asigna un precio a cada uno.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {vehiculos
                                .filter((v) => v.activo)
                                .map((vehiculo) => {
                                  const existingPrice = servicioPrecios.find(
                                    (p: PrecioVehiculo) => p.vehiculoId === vehiculo.id && p.activo
                                  );
                                  const localPrice = vehiclePrices[vehiculo.id] || existingPrice?.precio?.toString() || '';
                                  const isAdding = addingVehicles[vehiculo.id] || false;

                                  const handleAddVehicle = async () => {
                                    const price = vehiclePrices[vehiculo.id];
                                    if (!price || isNaN(Number(price))) {
                                      alert('Por favor ingresa un precio válido');
                                      return;
                                    }

                                    setAddingVehicles((prev) => ({ ...prev, [vehiculo.id]: true }));
                                    try {
                                      const response = await fetch('/api/precios/vehiculos', {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          serviceCodigo: servicio.codigo,
                                          vehiculoId: vehiculo.id,
                                          pasajerosMin: vehiculo.capacidadMin,
                                          pasajerosMax: vehiculo.capacidadMax,
                                          precio: Number(price),
                                        }),
                                      });

                                      const data = await response.json();
                                      if (data.success) {
                                        await fetchData();
                                        setVehiclePrices((prev) => {
                                          const newState = { ...prev };
                                          delete newState[vehiculo.id];
                                          return newState;
                                        });
                                        alert('Vehículo agregado correctamente');
                                      } else {
                                        alert('Error al agregar el vehículo');
                                      }
                                    } catch (error) {
                                      console.error('Error adding vehicle:', error);
                                      alert('Error al agregar el vehículo');
                                    } finally {
                                      setAddingVehicles((prev) => {
                                        const newState = { ...prev };
                                        delete newState[vehiculo.id];
                                        return newState;
                                      });
                                    }
                                  };

                                  return (
                                    <div
                                      key={vehiculo.id}
                                      className={`p-5 border-2 rounded-xl transition-all ${
                                        existingPrice
                                          ? 'border-green-300 bg-green-50'
                                          : 'border-gray-200 bg-white hover:border-gray-300'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3 mb-3">
                                        {vehiculo.imagenUrl && (
                                          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                              src={vehiculo.imagenUrl}
                                              alt={vehiculo.nombre}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-bold text-gray-900 text-sm truncate">
                                            {vehiculo.nombre}
                                          </p>
                                          <p className="text-xs text-gray-600">
                                            {vehiculo.capacidadMin} - {vehiculo.capacidadMax} personas
                                          </p>
                                        </div>
                                      </div>

                                      {existingPrice ? (
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Precio actual:</span>
                                            <span className="text-lg font-bold text-green-700">
                                              {formatPrice(existingPrice.precio)}
                                            </span>
                                          </div>
                                          <button
                                            onClick={async () => {
                                              if (
                                                confirm(
                                                  '¿Estás seguro de que quieres eliminar este vehículo del tour?'
                                                )
                                              ) {
                                                try {
                                                  const response = await fetch(
                                                    `/api/precios/vehiculos?serviceCodigo=${servicio.codigo}&precioId=${existingPrice.id}`,
                                                    {
                                                      method: 'DELETE',
                                                    }
                                                  );
                                                  const data = await response.json();
                                                  if (data.success) {
                                                    await fetchData();
                                                    alert('Vehículo eliminado del tour');
                                                  }
                                                } catch (error) {
                                                  console.error('Error removing vehicle:', error);
                                                }
                                              }
                                            }}
                                            className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                          >
                                            Eliminar del Tour
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <input
                                            type="number"
                                            value={localPrice}
                                            onChange={(e) => setVehiclePrices((prev) => ({ ...prev, [vehiculo.id]: e.target.value }))}
                                            placeholder="Precio en COP"
                                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black text-sm"
                                            disabled={isAdding}
                                          />
                                          <button
                                            onClick={handleAddVehicle}
                                            disabled={isAdding || !localPrice}
                                            className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
                                          >
                                            {isAdding ? (
                                              <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Agregando...</span>
                                              </>
                                            ) : (
                                              <>
                                                <Plus className="w-4 h-4" />
                                                <span>Agregar al Tour</span>
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {/* Qué Incluye */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            ✅ Qué Incluye
                          </h3>
                          {isEditing ? (
                            <div className="space-y-2">
                              {((editedService.configuracion?.incluye || configuracion.incluye || []).length > 0 
                                ? (editedService.configuracion?.incluye || configuracion.incluye || [])
                                : ['']).map((item: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newIncluye = [...(editedService.configuracion?.incluye || configuracion.incluye || [])];
                                      newIncluye[index] = e.target.value;
                                      handleChange('configuracion', {
                                        ...(editedService.configuracion || configuracion),
                                        incluye: newIncluye,
                                      });
                                    }}
                                    className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                                    placeholder="ej: Transporte privado"
                                  />
                                  <button
                                    onClick={() => {
                                      const newIncluye = [...(editedService.configuracion?.incluye || configuracion.incluye || [])];
                                      newIncluye.splice(index, 1);
                                      handleChange('configuracion', {
                                        ...(editedService.configuracion || configuracion),
                                        incluye: newIncluye.length > 0 ? newIncluye : [''],
                                      });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newIncluye = [...(editedService.configuracion?.incluye || configuracion.incluye || ['']), ''];
                                  handleChange('configuracion', {
                                    ...(editedService.configuracion || configuracion),
                                    incluye: newIncluye,
                                  });
                                }}
                                className="px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Agregar ítem
                              </button>
                            </div>
                          ) : (
                            configuracion.incluye && Array.isArray(configuracion.incluye) && configuracion.incluye.length > 0 && (
                              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {configuracion.incluye.map((item: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-green-600 mt-1">•</span>
                                      <span className="text-gray-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>

                        {/* Qué NO Incluye */}
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            ❌ Qué NO Incluye
                          </h3>
                          {isEditing ? (
                            <div className="space-y-2">
                              {((editedService.configuracion?.noIncluye || configuracion.noIncluye || []).length > 0 
                                ? (editedService.configuracion?.noIncluye || configuracion.noIncluye || [])
                                : ['']).map((item: string, index: number) => (
                                <div key={index} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newNoIncluye = [...(editedService.configuracion?.noIncluye || configuracion.noIncluye || [])];
                                      newNoIncluye[index] = e.target.value;
                                      handleChange('configuracion', {
                                        ...(editedService.configuracion || configuracion),
                                        noIncluye: newNoIncluye,
                                      });
                                    }}
                                    className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                                    placeholder="ej: Entradas a museos"
                                  />
                                  <button
                                    onClick={() => {
                                      const newNoIncluye = [...(editedService.configuracion?.noIncluye || configuracion.noIncluye || [])];
                                      newNoIncluye.splice(index, 1);
                                      handleChange('configuracion', {
                                        ...(editedService.configuracion || configuracion),
                                        noIncluye: newNoIncluye.length > 0 ? newNoIncluye : [''],
                                      });
                                    }}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newNoIncluye = [...(editedService.configuracion?.noIncluye || configuracion.noIncluye || ['']), ''];
                                  handleChange('configuracion', {
                                    ...(editedService.configuracion || configuracion),
                                    noIncluye: newNoIncluye,
                                  });
                                }}
                                className="px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Agregar ítem
                              </button>
                            </div>
                          ) : (
                            configuracion.noIncluye && Array.isArray(configuracion.noIncluye) && configuracion.noIncluye.length > 0 && (
                              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <ul className="space-y-2">
                                  {configuracion.noIncluye.map((item: string, index: number) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-red-600 mt-1">•</span>
                                      <span className="text-gray-700">{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </div>


                        {/* Precios Adicionales (solo para Guatapé) */}
                        {preciosAdicionales.length > 0 && (
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <DollarSign className="w-6 h-6" />
                              Precios Adicionales (Extras)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {preciosAdicionales.map((precio: PrecioAdicional) => {
                                const isEditingPrice = editingPrices[precio.id] !== undefined;
                                const isSaving = savingPrices[precio.id];

                                return (
                                  <div
                                    key={precio.id}
                                    className="p-5 border-2 border-blue-200 rounded-xl hover:border-blue-300 transition-all bg-blue-50 shadow-sm"
                                  >
                                    <div className="flex items-center gap-2 mb-3">
                                      <p className="font-bold text-gray-900 text-lg">
                                        {getAdditionalPriceLabel(precio.tipo, precio.rango)}
                                      </p>
                                    </div>
                                    
                                    {isEditingPrice ? (
                                      <div className="space-y-2">
                                        <input
                                          type="number"
                                          value={editingPrices[precio.id]}
                                          onChange={(e) => handlePriceChange(precio.id, e.target.value)}
                                          className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                                          placeholder="Nuevo precio"
                                          disabled={isSaving}
                                        />
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => savePriceChange(servicio.codigo, precio.id, true)}
                                            disabled={isSaving}
                                            className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                          >
                                            {isSaving ? (
                                              <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">Guardando...</span>
                                              </>
                                            ) : (
                                              <>
                                                <Check className="w-4 h-4" />
                                                <span className="text-sm">Guardar</span>
                                              </>
                                            )}
                                          </button>
                                          <button
                                            onClick={() => {
                                              setEditingPrices((prev) => {
                                                const newState = { ...prev };
                                                delete newState[precio.id];
                                                return newState;
                                              });
                                            }}
                                            disabled={isSaving}
                                            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center justify-between">
                                        <p className="text-2xl font-bold text-gray-900">
                                          {formatPrice(precio.precio)}
                                        </p>
                                        <button
                                          onClick={() => handlePriceChange(precio.id, precio.precio.toString())}
                                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                                          title="Editar precio"
                                        >
                                          <Edit2 className="w-4 h-4 text-gray-600" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Precios de Servicios Adicionales Específicos */}
                        {isEditing && (servicio.codigo === 'parapente-tour' || servicio.codigo === 'atv-tour') && (
                          <div className="pt-6 border-t-2 border-gray-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                              <DollarSign className="w-6 h-6" />
                              Precios de Servicios Adicionales
                            </h3>
                            <div className="space-y-4">
                              {servicio.codigo === 'parapente-tour' && (
                                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio por persona - Parapente
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">$</span>
                                    <input
                                      type="number"
                                      value={editedService.configuracion?.precioParapente || configuracion.precioParapente || 250000}
                                      onChange={(e) => {
                                        handleChange('configuracion', {
                                          ...(editedService.configuracion || configuracion),
                                          precioParapente: Number(e.target.value) || 0,
                                        });
                                      }}
                                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                                      placeholder="250000"
                                      min="0"
                                    />
                                    <span className="text-xs text-gray-500">COP</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Precio que se cobrará por cada persona que participe en parapente
                                  </p>
                                </div>
                              )}
                              
                              {servicio.codigo === 'atv-tour' && (
                                <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio por moto ATV
                                  </label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">$</span>
                                    <input
                                      type="number"
                                      value={editedService.configuracion?.precioAtv || configuracion.precioAtv || 300000}
                                      onChange={(e) => {
                                        handleChange('configuracion', {
                                          ...(editedService.configuracion || configuracion),
                                          precioAtv: Number(e.target.value) || 0,
                                        });
                                      }}
                                      className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                                      placeholder="300000"
                                      min="0"
                                    />
                                    <span className="text-xs text-gray-500">COP</span>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">
                                    Precio que se cobrará por cada moto ATV
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Precios por Municipio */}
                        <div className="pt-6 border-t-2 border-gray-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin className="w-6 h-6" />
                            Precios por Municipio
                          </h3>
                          {isEditing ? (
                            <>
                              <p className="text-sm text-gray-600 mb-4">
                                Configura los precios para cada municipio según la capacidad del vehículo. Estos precios se aplicarán cuando el cliente seleccione un municipio en el formulario.
                              </p>
                              
                              <div className="space-y-6">
                                {[
                                  { key: 'envigado', label: 'Envigado' },
                                  { key: 'sabaneta', label: 'Sabaneta' },
                                  { key: 'itagui', label: 'Itagüí' },
                                  { key: 'medellin', label: 'Medellín' },
                                ].map((municipioData) => {
                                  const municipio = municipioData.key.toLowerCase();
                                const preciosMunicipios = editedService.configuracion?.preciosMunicipios || configuracion.preciosMunicipios || {};
                                const preciosMunicipio = preciosMunicipios[municipio] || {};
                                
                                const capacidades = [
                                  { key: '1-3', label: '1-3 personas' },
                                  { key: '4-4', label: '4 personas' },
                                  { key: '5-8', label: '5-8 personas' },
                                  { key: '9-15', label: '9-15 personas' },
                                  { key: '16-18', label: '16-18 personas' },
                                  { key: '19-25', label: '19-25 personas' },
                                ];

                                  return (
                                    <div key={municipio} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-3">{municipioData.label}</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {capacidades.map((capacidad) => {
                                        const precioActual = preciosMunicipio[capacidad.key] || 0;
                                        
                                        return (
                                          <div key={capacidad.key} className="bg-white rounded-lg p-3 border border-gray-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                              {capacidad.label}
                                            </label>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-gray-500">$</span>
                                              <input
                                                type="number"
                                                value={precioActual}
                                                onChange={(e) => {
                                                  const newPreciosMunicipios = { ...preciosMunicipios };
                                                  if (!newPreciosMunicipios[municipio]) {
                                                    newPreciosMunicipios[municipio] = {};
                                                  }
                                                  newPreciosMunicipios[municipio][capacidad.key] = Number(e.target.value) || 0;
                                                  
                                                  handleChange('configuracion', {
                                                    ...(editedService.configuracion || configuracion),
                                                    preciosMunicipios: newPreciosMunicipios,
                                                  });
                                                }}
                                                className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white"
                                                placeholder="0"
                                                min="0"
                                              />
                                              <span className="text-xs text-gray-500">COP</span>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            </>
                          ) : (
                            configuracion.preciosMunicipios && Object.keys(configuracion.preciosMunicipios).length > 0 ? (
                              <div className="space-y-4">
                                {Object.entries(configuracion.preciosMunicipios).map(([municipioKey, precios]: [string, any]) => {
                                  const municipioLabels: Record<string, string> = {
                                    'envigado': 'Envigado',
                                    'sabaneta': 'Sabaneta',
                                    'itagui': 'Itagüí',
                                    'medellin': 'Medellín',
                                  };
                                  const municipioLabel = municipioLabels[municipioKey.toLowerCase()] || municipioKey;
                                  
                                  return (
                                    <div key={municipioKey} className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                                      <h4 className="text-lg font-semibold text-gray-900 mb-3">{municipioLabel}</h4>
                                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                                        {Object.entries(precios).map(([capacidad, precio]: [string, any]) => (
                                          <div key={capacidad} className="bg-white rounded-lg p-2 border border-gray-200">
                                            <p className="text-xs text-gray-600 mb-1">{capacidad}</p>
                                            <p className="text-sm font-bold text-gray-900">
                                              {formatPrice(Number(precio))}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 italic">No hay precios de municipios configurados para este servicio.</p>
                            )
                          )}
                        </div>

                        {/* Estado */}
                        {isEditing && (
                          <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-200">
                            <label className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={editedService.activo ?? servicio.activo}
                                onChange={(e) =>
                                  handleChange('activo', e.target.checked)
                                }
                                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                              />
                              <span className="text-base font-medium text-gray-700 group-hover:text-black transition-colors">
                                Servicio activo y visible para clientes
                              </span>
                            </label>
                          </div>
                        )}

                        {/* Servicios Activos por Hotel */}
                        <div className="pt-6 border-t-2 border-gray-200">
                          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            🏨 Servicios Activos por Hotel
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Marca qué hoteles pueden ver este servicio. Si un servicio no está marcado para un hotel, ese hotel no lo verá en su vista.
                          </p>
                          
                          {hoteles.length === 0 ? (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                              <p className="text-sm text-yellow-800 font-medium">
                                ⚠️ No hay hoteles registrados
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Agrega hoteles en la sección "Aliados" primero.
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-xs text-gray-500 mb-2">
                                Total de hoteles: {hoteles.length}
                              </p>
                              {hoteles.map((hotel) => {
                                const isActivo = serviciosActivosPorHotel[hotel.id]?.has(servicio.id) || false;
                                return (
                                  <div
                                    key={hotel.id}
                                    className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-gray-300 transition-colors"
                                  >
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                      <input
                                        type="checkbox"
                                        checked={isActivo}
                                        onChange={() => handleToggleServicioActivo(hotel.id, servicio.id)}
                                        disabled={savingServiciosActivos}
                                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                      />
                                      <div className="flex-1">
                                        <span className="text-base font-medium text-gray-700 group-hover:text-black transition-colors">
                                          {hotel.nombre}
                                        </span>
                                        <span className="text-xs text-gray-500 ml-2 font-mono">
                                          ({hotel.codigo})
                                        </span>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {isActivo
                                            ? '✓ El hotel podrá ver y reservar este servicio'
                                            : '✗ El hotel NO podrá ver este servicio'}
                                        </p>
                                      </div>
                                    </label>
                                  </div>
                                );
                              })}
                              {savingServiciosActivos && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span>Guardando cambios...</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Service Modal */}
      <AddServiceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          fetchData();
          setIsAddModalOpen(false);
        }}
        vehiculos={vehiculos}
      />
    </div>
  );
}

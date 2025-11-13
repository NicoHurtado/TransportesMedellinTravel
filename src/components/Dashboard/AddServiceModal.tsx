'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, Trash2, ChevronDown, Upload, Image as ImageIcon } from 'lucide-react';

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  vehiculos: Array<{
    id: number;
    nombre: string;
    capacidadMin: number;
    capacidadMax: number;
  }>;
}

// Campos disponibles para el formulario
const CAMPOS_DISPONIBLES = [
  { id: 'lugarRecogida', label: 'Lugar de recogida', type: 'text' },
  { id: 'destino', label: 'Destino', type: 'text' },
  { id: 'fecha', label: 'Fecha', type: 'date' },
  { id: 'hora', label: 'Hora', type: 'time' },
  { id: 'numeroPasajeros', label: 'Número de pasajeros', type: 'number' },
  { id: 'idiomaTour', label: 'Idioma del tour', type: 'select' },
  { id: 'guiaCertificado', label: 'Guía certificado (Español/Inglés)', type: 'checkbox' },
  { id: 'numeroVuelo', label: 'Número de vuelo', type: 'text' },
  { id: 'listaAsistentes', label: 'Lista de asistentes', type: 'list' },
  { id: 'notasAdicionales', label: 'Notas adicionales', type: 'textarea' },
  { id: 'municipio', label: 'Municipio', type: 'select' },
];

export default function AddServiceModal({ isOpen, onClose, onSuccess, vehiculos }: AddServiceModalProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Info básica, 2: Campos, 3: Vehículos

  // Datos del servicio
  const [codigo, setCodigo] = useState('');
  const [nombreEs, setNombreEs] = useState('');
  const [nombreEn, setNombreEn] = useState('');
  const [descripcionCortaEs, setDescripcionCortaEs] = useState('');
  const [descripcionCortaEn, setDescripcionCortaEn] = useState('');
  const [descripcionCompletaEs, setDescripcionCompletaEs] = useState('');
  const [descripcionCompletaEn, setDescripcionCompletaEn] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [tipo, setTipo] = useState<'tour' | 'transfer'>('tour');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Qué incluye / No incluye
  const [incluye, setIncluye] = useState<string[]>(['']);
  const [noIncluye, setNoIncluye] = useState<string[]>(['']);

  // Campos del formulario
  const [camposSeleccionados, setCamposSeleccionados] = useState<string[]>([]);
  const [camposPersonalizados, setCamposPersonalizados] = useState<Array<{ 
    label: string; 
    type: string;
    necesitaValor?: boolean;
    precioPorPersona?: number;
  }>>([]);

  // Vehículos y precios
  const [vehiculosSeleccionados, setVehiculosSeleccionados] = useState<Array<{
    vehiculoId: number;
    precio: number;
  }>>([]);

  const handleAddIncluye = () => {
    setIncluye([...incluye, '']);
  };

  const handleRemoveIncluye = (index: number) => {
    setIncluye(incluye.filter((_, i) => i !== index));
  };

  const handleUpdateIncluye = (index: number, value: string) => {
    const newIncluye = [...incluye];
    newIncluye[index] = value;
    setIncluye(newIncluye);
  };

  const handleAddNoIncluye = () => {
    setNoIncluye([...noIncluye, '']);
  };

  const handleRemoveNoIncluye = (index: number) => {
    setNoIncluye(noIncluye.filter((_, i) => i !== index));
  };

  const handleUpdateNoIncluye = (index: number, value: string) => {
    const newNoIncluye = [...noIncluye];
    newNoIncluye[index] = value;
    setNoIncluye(newNoIncluye);
  };

  const handleToggleCampo = (campoId: string) => {
    if (camposSeleccionados.includes(campoId)) {
      setCamposSeleccionados(camposSeleccionados.filter((c) => c !== campoId));
    } else {
      setCamposSeleccionados([...camposSeleccionados, campoId]);
    }
  };

  const handleAddCampoPersonalizado = () => {
    setCamposPersonalizados([...camposPersonalizados, { label: '', type: 'text', necesitaValor: false, precioPorPersona: 0 }]);
  };

  const handleUpdateCampoPersonalizado = (index: number, field: 'label' | 'type' | 'necesitaValor' | 'precioPorPersona', value: string | boolean | number) => {
    const newCampos = [...camposPersonalizados];
    if (field === 'necesitaValor') {
      newCampos[index].necesitaValor = value as boolean;
      if (!value) {
        newCampos[index].precioPorPersona = 0;
      }
    } else if (field === 'precioPorPersona') {
      newCampos[index].precioPorPersona = Number(value);
    } else {
      (newCampos[index] as any)[field] = value;
    }
    setCamposPersonalizados(newCampos);
  };

  const handleRemoveCampoPersonalizado = (index: number) => {
    setCamposPersonalizados(camposPersonalizados.filter((_, i) => i !== index));
  };

  const handleToggleVehiculo = (vehiculoId: number) => {
    const exists = vehiculosSeleccionados.find((v) => v.vehiculoId === vehiculoId);
    if (exists) {
      setVehiculosSeleccionados(vehiculosSeleccionados.filter((v) => v.vehiculoId !== vehiculoId));
    } else {
      setVehiculosSeleccionados([...vehiculosSeleccionados, { vehiculoId, precio: 0 }]);
    }
  };

  const handleUpdatePrecioVehiculo = (vehiculoId: number, precio: number) => {
    setVehiculosSeleccionados(
      vehiculosSeleccionados.map((v) =>
        v.vehiculoId === vehiculoId ? { ...v, precio } : v
      )
    );
  };

  const handleUploadImage = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('El archivo debe ser una imagen');
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-upload-type': 'services',
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      setImagenUrl(data.data.url);
    } catch (err: any) {
      setError(err.message || 'Error al subir la imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUploadImage(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUploadImage(files[0]);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSaving(true);

    try {
      // Validaciones
      if (!codigo || !nombreEs || !nombreEn) {
        throw new Error('Completa todos los campos requeridos');
      }

      if (vehiculosSeleccionados.length === 0) {
        throw new Error('Selecciona al menos un vehículo');
      }

      if (vehiculosSeleccionados.some((v) => v.precio <= 0)) {
        throw new Error('Todos los vehículos deben tener un precio mayor a 0');
      }

      // Configuración del servicio
      const configuracion = {
        incluye: incluye.filter((i) => i.trim() !== ''),
        noIncluye: noIncluye.filter((i) => i.trim() !== ''),
        campos: camposSeleccionados,
        camposPersonalizados: camposPersonalizados.filter((c) => c.label.trim() !== ''),
      };

      // Crear servicio
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo: codigo.toLowerCase().replace(/\s+/g, '-'),
          nombreEs,
          nombreEn,
          descripcionCortaEs,
          descripcionCortaEn,
          descripcionCompletaEs,
          descripcionCompletaEn,
          imagenUrl: imagenUrl || '/medellin.jpg',
          tipo,
          activo: true,
          ordenDisplay: 999,
          configuracion,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error al crear el servicio');
      }

      const servicioCodigo = codigo.toLowerCase().replace(/\s+/g, '-');

      // Crear precios de vehículos
      const precioPromises = vehiculosSeleccionados.map(async (vehiculoSeleccionado) => {
        const vehiculo = vehiculos.find((v) => v.id === vehiculoSeleccionado.vehiculoId);
        if (!vehiculo) return null;

        try {
          const precioResponse = await fetch('/api/precios/vehiculos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              serviceCodigo: servicioCodigo,
              vehiculoId: vehiculoSeleccionado.vehiculoId,
              pasajerosMin: vehiculo.capacidadMin,
              pasajerosMax: vehiculo.capacidadMax,
              precio: vehiculoSeleccionado.precio,
            }),
          });

          const precioData = await precioResponse.json();
          if (!precioData.success) {
            console.error(`Error creando precio para vehículo ${vehiculoSeleccionado.vehiculoId}:`, precioData.error);
            // Si el servicio no está en el mapeo, guardar en configuración
            return {
              vehiculoId: vehiculoSeleccionado.vehiculoId,
              precio: vehiculoSeleccionado.precio,
              pasajerosMin: vehiculo.capacidadMin,
              pasajerosMax: vehiculo.capacidadMax,
            };
          }
          return null;
        } catch (err) {
          console.error(`Error creando precio para vehículo ${vehiculoSeleccionado.vehiculoId}:`, err);
          // Si falla, guardar en configuración como respaldo
          return {
            vehiculoId: vehiculoSeleccionado.vehiculoId,
            precio: vehiculoSeleccionado.precio,
            pasajerosMin: vehiculo.capacidadMin,
            pasajerosMax: vehiculo.capacidadMax,
          };
        }
      });

      const preciosResultados = await Promise.all(precioPromises);
      const preciosFallback = preciosResultados.filter((p) => p !== null);

      // Si hay precios que no se pudieron crear en tablas específicas, guardarlos en configuración
      if (preciosFallback.length > 0) {
        const servicioActualizado = await fetch(`/api/services/${data.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            configuracion: {
              ...configuracion,
              preciosVehiculos: preciosFallback,
            },
          }),
        });
      }

      alert('✅ Servicio creado exitosamente');
      onSuccess();
      onClose();
      resetForm();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setCodigo('');
    setNombreEs('');
    setNombreEn('');
    setDescripcionCortaEs('');
    setDescripcionCortaEn('');
    setDescripcionCompletaEs('');
    setDescripcionCompletaEn('');
    setImagenUrl('');
    setTipo('tour');
    setIncluye(['']);
    setNoIncluye(['']);
    setCamposSeleccionados([]);
    setCamposPersonalizados([]);
    setVehiculosSeleccionados([]);
    setStep(1);
    setError(null);
    setIsDragging(false);
    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Agregar Nuevo Servicio</h2>
              <p className="text-sm text-gray-600 mt-1">
                Paso {step} de 3: {step === 1 ? 'Información Básica' : step === 2 ? 'Campos del Formulario' : 'Vehículos y Precios'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                {error}
              </div>
            )}

            {/* Step 1: Información Básica */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Código */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Código del servicio (único, sin espacios) *
                  </label>
                  <input
                    type="text"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    placeholder="ej: tour-santa-elena"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                  />
                  <p className="text-xs text-gray-500 mt-1">Se usará en la URL: /servicios/{codigo}</p>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de servicio *</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setTipo('tour')}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        tipo === 'tour'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      🎯 Tour
                    </button>
                    <button
                      onClick={() => setTipo('transfer')}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                        tipo === 'transfer'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      🚗 Transfer
                    </button>
                  </div>
                </div>

                {/* Nombres */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇪🇸 Nombre (Español) *
                    </label>
                    <input
                      type="text"
                      value={nombreEs}
                      onChange={(e) => setNombreEs(e.target.value)}
                      placeholder="Tour Santa Elena"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇺🇸 Nombre (Inglés) *
                    </label>
                    <input
                      type="text"
                      value={nombreEn}
                      onChange={(e) => setNombreEn(e.target.value)}
                      placeholder="Santa Elena Tour"
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                {/* Descripciones Cortas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇪🇸 Descripción Corta (Español)
                    </label>
                    <textarea
                      value={descripcionCortaEs}
                      onChange={(e) => setDescripcionCortaEs(e.target.value)}
                      rows={3}
                      placeholder="Descubre las flores y la cultura..."
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇺🇸 Short Description (English)
                    </label>
                    <textarea
                      value={descripcionCortaEn}
                      onChange={(e) => setDescripcionCortaEn(e.target.value)}
                      rows={3}
                      placeholder="Discover the flowers and culture..."
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                {/* Descripciones Completas */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇪🇸 Descripción Completa (Español)
                    </label>
                    <textarea
                      value={descripcionCompletaEs}
                      onChange={(e) => setDescripcionCompletaEs(e.target.value)}
                      rows={5}
                      placeholder="Descripción detallada del servicio..."
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🇺🇸 Complete Description (English)
                    </label>
                    <textarea
                      value={descripcionCompletaEn}
                      onChange={(e) => setDescripcionCompletaEn(e.target.value)}
                      rows={5}
                      placeholder="Detailed service description..."
                      className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                {/* Imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen del servicio
                  </label>
                  
                  {/* Zona de Drag and Drop */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-black bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                    } ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black" />
                        <p className="text-sm text-gray-600">Subiendo imagen...</p>
                      </div>
                    ) : imagenUrl ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-300">
                          <img
                            src={imagenUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-5 h-5 text-green-600" />
                          <p className="text-sm text-gray-700 font-medium">Imagen cargada</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagenUrl('');
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Eliminar imagen
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <Upload className="w-12 h-12 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Arrastra una imagen aquí o haz clic para seleccionar
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            PNG, JPG, WEBP hasta 10MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Campo de URL manual (opcional) */}
                  <div className="mt-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2">
                      O ingresa una URL manualmente:
                  </label>
                  <input
                    type="text"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                      placeholder="/ruta-imagen.jpg o https://..."
                      className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black text-sm"
                  />
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Si no especificas, se usará una imagen por defecto
                  </p>
                </div>

                {/* Qué Incluye */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ✅ Qué Incluye
                  </label>
                  {incluye.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateIncluye(index, e.target.value)}
                        placeholder="ej: Transporte privado"
                        className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                      />
                      <button
                        onClick={() => handleRemoveIncluye(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddIncluye}
                    className="mt-2 px-4 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar ítem
                  </button>
                </div>

                {/* Qué NO Incluye */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ❌ Qué NO Incluye
                  </label>
                  {noIncluye.map((item, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateNoIncluye(index, e.target.value)}
                        placeholder="ej: Entradas a museos"
                        className="flex-1 px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                      />
                      <button
                        onClick={() => handleRemoveNoIncluye(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={handleAddNoIncluye}
                    className="mt-2 px-4 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar ítem
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Campos del Formulario */}
            {step === 2 && (
              <div className="space-y-6">
                <p className="text-gray-700">
                  Selecciona los campos que aparecerán en el formulario de reserva:
                </p>

                {/* Campos Predefinidos */}
                <div className="space-y-2">
                  {CAMPOS_DISPONIBLES.map((campo) => (
                    <label
                      key={campo.id}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        camposSeleccionados.includes(campo.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={camposSeleccionados.includes(campo.id)}
                        onChange={() => handleToggleCampo(campo.id)}
                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{campo.label}</span>
                        <span className="text-xs text-gray-500 ml-2">({campo.type})</span>
                      </div>
                      {camposSeleccionados.includes(campo.id) && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </label>
                  ))}
                </div>

                {/* Campos Personalizados */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Campos Personalizados
                  </h3>
                  {camposPersonalizados.map((campo, index) => (
                    <div key={index} className="border-2 border-gray-200 rounded-xl p-4 mb-4 bg-gray-50">
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={campo.label}
                          onChange={(e) => handleUpdateCampoPersonalizado(index, 'label', e.target.value)}
                          placeholder="Nombre del campo (ej: Entrada a atracción)"
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black bg-white"
                        />
                        <select
                          value={campo.type}
                          onChange={(e) => handleUpdateCampoPersonalizado(index, 'type', e.target.value)}
                          className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                        >
                          <option value="text">Texto</option>
                          <option value="number">Número</option>
                          <option value="date">Fecha</option>
                          <option value="textarea">Área de texto</option>
                          <option value="select">Selector</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                        <button
                          onClick={() => handleRemoveCampoPersonalizado(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Opción de precio por persona */}
                      <div className="space-y-3 ml-2">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={campo.necesitaValor || false}
                            onChange={(e) => handleUpdateCampoPersonalizado(index, 'necesitaValor', e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            Necesita valor/precio
                          </span>
                        </label>
                        
                        {campo.necesitaValor && (
                          <div className="flex items-center gap-2 bg-white p-3 rounded-lg border-2 border-gray-300">
                            <span className="text-sm text-gray-600">$</span>
                            <input
                              type="number"
                              value={campo.precioPorPersona || 0}
                              onChange={(e) => handleUpdateCampoPersonalizado(index, 'precioPorPersona', e.target.value)}
                              placeholder="0"
                              min="0"
                              className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
                            />
                            <span className="text-sm text-gray-600 font-medium">por persona</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={handleAddCampoPersonalizado}
                    className="mt-2 px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar campo personalizado
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Vehículos y Precios */}
            {step === 3 && (
              <div className="space-y-6">
                <p className="text-gray-700">
                  Selecciona los vehículos disponibles y define sus precios:
                </p>

                <div className="space-y-3">
                  {vehiculos.map((vehiculo) => {
                    const isSelected = vehiculosSeleccionados.find((v) => v.vehiculoId === vehiculo.id);
                    
                    return (
                      <div
                        key={vehiculo.id}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          isSelected
                            ? 'bg-green-50 border-green-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => handleToggleVehiculo(vehiculo.id)}
                            className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-gray-900">{vehiculo.nombre}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({vehiculo.capacidadMin}-{vehiculo.capacidadMax} pasajeros)
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="ml-8">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Precio (COP)
                            </label>
                            <input
                              type="number"
                              value={isSelected.precio}
                              onChange={(e) => handleUpdatePrecioVehiculo(vehiculo.id, Number(e.target.value))}
                              placeholder="150000"
                              className="w-full px-4 py-2 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  onClose();
                }
              }}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              {step === 1 ? 'Cancelar' : 'Atrás'}
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!codigo || !nombreEs || !nombreEn)}
                className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving || vehiculosSeleccionados.length === 0}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Crear Servicio
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


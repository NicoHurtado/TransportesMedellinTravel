'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Truck,
  Save,
  CheckCircle,
  Languages,
  Download,
  MessageCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface ReservaDetalle {
  id: number;
  codigoReserva: string;
  estado: string;
  fecha: string;
  hora: string;
  numeroPasajeros: number;
  idiomaInterfaz?: string;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  precioTotal: number;
  precioFinal: number;
  comisionHotel: number;
  conductorAsignado?: string;
  vehiculoAsignado?: string;
  notasAdmin?: string;
  peticionesEspeciales?: string;
  personasAsistentes?: any[];
  vehiculo?: {
    nombre: string;
  };
  hotel?: {
    nombre: string;
  };
  [key: string]: any;
}

interface Conductor {
  id: number;
  nombre: string;
  whatsapp: string;
  notasAdicionales?: string;
  activo: boolean;
}

export default function ReservaDetallePage() {
  const params = useParams();
  const router = useRouter();
  const [reserva, setReserva] = useState<ReservaDetalle | null>(null);
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form state
  const [estado, setEstado] = useState('');
  const [conductorAsignado, setConductorAsignado] = useState('');
  // Campos para agregar cotización
  const [precioTotal, setPrecioTotal] = useState<number>(0);
  const [precioFinal, setPrecioFinal] = useState<number>(0);
  const [comisionHotel, setComisionHotel] = useState<number>(0);

  useEffect(() => {
    fetchReserva();
    fetchConductores();
  }, [params.servicio, params.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchReserva = async () => {
    try {
      const response = await fetch(
        `/api/reservations/${params.servicio}/${params.id}`
      );
      const data = await response.json();

      if (data.success) {
        setReserva(data.data);
        setEstado(data.data.estado);
        setConductorAsignado(data.data.conductorAsignado || '');
        // Inicializar campos de precio
        setPrecioTotal(data.data.precioTotal || 0);
        setPrecioFinal(data.data.precioFinal || 0);
        setComisionHotel(data.data.comisionHotel || 0);
      }
    } catch (error) {
      console.error('Error fetching reservation:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConductores = async () => {
    try {
      const response = await fetch('/api/conductores');
      const result = await response.json();
      if (result.success) {
        setConductores(result.data.filter((c: Conductor) => c.activo));
      }
    } catch (error) {
      console.error('Error fetching conductores:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Determinar el estado final: si hay precios y está pendiente_por_cotizacion, cambiar a agendada_con_cotizacion
      let estadoFinal = estado;
      if (reserva?.estado === 'pendiente_por_cotizacion' && precioFinal > 0) {
        estadoFinal = 'agendada_con_cotizacion';
        setEstado('agendada_con_cotizacion'); // Actualizar el estado en el componente también
      }

      const updateData: any = {
        tipoServicio: params.servicio,
        id: parseInt(params.id as string),
        estado: estadoFinal,
        conductorAsignado: conductorAsignado || null,
        vehiculoAsignado: null,
        notasAdmin: null,
      };

      // Siempre incluir los precios si están definidos y son mayores a 0
      if (precioFinal > 0) {
        updateData.precioTotal = precioTotal;
        updateData.precioFinal = precioFinal;
        updateData.comisionHotel = comisionHotel || 0;
      }

      console.log('💾 Guardando cotización:', {
        estadoAnterior: reserva?.estado,
        estadoNuevo: estadoFinal,
        precioTotal,
        precioFinal,
        comisionHotel,
        updateData
      });

      const response = await fetch('/api/reservations/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Cotización guardada exitosamente:', result);
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
        // Recargar la reserva para obtener los datos actualizados
        await fetchReserva();
      } else {
        const errorData = await response.json();
        console.error('❌ Error al guardar:', errorData);
        alert('Error al guardar la cotización. Por favor intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error al guardar la cotización. Por favor intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imageRef.current || !reserva) return;
    
    setGeneratingImage(true);
    try {
      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      const link = document.createElement('a');
      link.download = `servicio-${reserva.codigoReserva}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error al generar la imagen');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleShareWithDriver = async () => {
    if (!reserva || !conductorAsignado) {
      alert('Por favor asigna un conductor primero');
      return;
    }

    const selectedConductor = conductores.find(c => c.nombre === conductorAsignado);
    if (!selectedConductor) {
      alert('Conductor no encontrado');
      return;
    }

    // Generate image first
    if (!imageRef.current) return;
    
    setGeneratingImage(true);
    try {
      const canvas = await html2canvas(imageRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });
      
      // Download image
      const link = document.createElement('a');
      link.download = `servicio-${reserva.codigoReserva}.png`;
      link.href = canvas.toDataURL();
      link.click();

      // Open WhatsApp with the driver
      const phone = selectedConductor.whatsapp.replace(/\D/g, '');
      const message = encodeURIComponent(
        `🚗 *Nuevo Servicio Asignado*\n\n` +
        `📍 Dirección: ${reserva.origen || reserva.lugarRecogida || 'Ver imagen'}\n` +
        `📅 Fecha: ${new Date(reserva.fecha).toLocaleDateString('es-CO')}\n` +
        `🕐 Hora: ${reserva.hora}\n` +
        `👥 Pasajeros: ${reserva.numeroPasajeros}\n` +
        `📞 Cliente: ${reserva.nombreContacto} - ${reserva.telefonoContacto}\n\n` +
        `*La imagen con todos los detalles se ha descargado. Por favor envíala al conductor.*`
      );
      
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    } catch (error) {
      console.error('Error sharing with driver:', error);
      alert('Error al compartir con el conductor');
    } finally {
      setGeneratingImage(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const estadoColors: Record<string, string> = {
    pendiente_por_cotizacion: 'bg-orange-100 text-orange-800',
    agendada_con_cotizacion: 'bg-blue-100 text-blue-800',
    pagado: 'bg-yellow-100 text-yellow-800',
    asignada: 'bg-purple-100 text-purple-800',
    completada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendiente_por_cotizacion: 'Pendiente por cotización',
      agendada_con_cotizacion: 'Agendada con cotización - Esperando Pago',
      pagado: 'Pagado',
      asignada: 'Asignada',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return labels[estado] || estado;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reserva...</p>
        </div>
      </div>
    );
  }

  if (!reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Reserva no encontrada</p>
          <button
            onClick={() => router.push('/panel/dashboard')}
            className="mt-4 text-black font-semibold hover:underline"
          >
            Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  const selectedConductor = conductores.find(c => c.nombre === conductorAsignado);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/panel/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al dashboard
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Reserva {reserva.codigoReserva}
              </h1>
              <span
                className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold ${
                  estadoColors[reserva.estado]
                }`}
              >
                {getEstadoLabel(reserva.estado)}
              </span>
            </div>
          </div>
        </div>

        {/* Saved Message */}
        {savedMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">✅ Cotización guardada exitosamente</p>
                {estado === 'agendada_con_cotizacion' && (
                  <p className="text-sm text-green-700 mt-1">
                    El correo con la cotización ha sido enviado al cliente. El cliente podrá proceder con el pago desde la página de seguimiento.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Reservation Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Información del Servicio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(reserva.fecha)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Hora</p>
                    <p className="font-semibold text-gray-900">{reserva.hora}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Pasajeros</p>
                    <p className="font-semibold text-gray-900">
                      {reserva.numeroPasajeros}
                    </p>
                  </div>
                </div>
                {reserva.vehiculo && (
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Vehículo Requerido</p>
                      <p className="font-semibold text-gray-900">
                        {reserva.vehiculo.nombre}
                      </p>
                    </div>
                  </div>
                )}
                {reserva.idiomaInterfaz && (
                  <div className="flex items-start gap-3">
                    <Languages className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Idioma</p>
                      <p className="font-semibold text-gray-900">
                        {reserva.idiomaInterfaz === 'es' ? 'Español' : 'Inglés'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Locations */}
              {(reserva.origen || reserva.lugarRecogida) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-3 mb-4">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-1">
                        {reserva.direccion === 'to' ? 'Origen' : 'Lugar de Recogida'}
                      </p>
                      <p className="font-semibold text-gray-900 text-lg">
                        {reserva.origen || reserva.lugarRecogida}
                      </p>
                    </div>
                  </div>
                  {reserva.destino && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-500 mb-1">Destino</p>
                        <p className="font-semibold text-gray-900 text-lg">
                          {reserva.destino}
                        </p>
                      </div>
                    </div>
                  )}
                  {reserva.municipio && (
                    <div className="mt-3 text-sm text-gray-600">
                      <span className="font-medium">Municipio:</span> {reserva.municipio}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información de Contacto
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-semibold text-gray-900">
                      {reserva.nombreContacto}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-semibold text-gray-900">
                      {reserva.telefonoContacto}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-900">
                      {reserva.emailContacto}
                    </p>
                  </div>
                </div>
              </div>

              {reserva.hotel && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-1">Hotel Aliado</p>
                  <p className="font-semibold text-gray-900">
                    {reserva.hotel.nombre}
                  </p>
                </div>
              )}
            </div>

            {/* Personas Asistentes */}
            {reserva.personasAsistentes && reserva.personasAsistentes.length > 0 && (() => {
              console.log('Personas Asistentes:', reserva.personasAsistentes);
              return (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Personas Asistentes ({reserva.personasAsistentes.length})
                </h2>
                <div className="space-y-2">
                  {reserva.personasAsistentes.map((persona: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-bold text-gray-700 text-lg mt-0.5">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {typeof persona === 'string' ? persona : persona.name || persona.nombre || 'Sin nombre'}
                        </p>
                        {typeof persona === 'object' && persona.edad && (
                          <p className="text-sm text-gray-600">
                            {persona.edad} años
                          </p>
                        )}
                        {typeof persona === 'object' && (persona.identificationNumber || persona.documento) && (
                          <p className="text-sm text-gray-600 font-mono mt-1">
                            Doc: {persona.identificationNumber || persona.documento}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              );
            })()}

            {/* Pricing */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Desglose de Precios
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span>Precio Total</span>
                  <span className="font-semibold">{formatPrice(reserva.precioTotal)}</span>
                </div>
                {reserva.comisionHotel > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span>Comisión Hotel</span>
                    <span className="font-semibold text-red-600">
                      -{formatPrice(reserva.comisionHotel)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                  <span>Precio Final</span>
                  <span>{formatPrice(reserva.precioFinal)}</span>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            {reserva.notasCliente && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Notas del Cliente
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {reserva.notasCliente}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Management */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Gestión de Reserva
              </h2>
              <div className="space-y-4">
                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Estado
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'pendiente_por_cotizacion', label: 'Pendiente por cotización', color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100', icon: '⏳' },
                      { value: 'agendada_con_cotizacion', label: 'Agendada con cotización - Esperando Pago', color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', icon: '✓' },
                      { value: 'pagado', label: 'Pagado', color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100', icon: '✅' },
                      { value: 'asignada', label: 'Asignada', color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100', icon: '👤' },
                      { value: 'completada', label: 'Completada', color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100', icon: '✔' },
                      { value: 'cancelada', label: 'Cancelada', color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100', icon: '✖' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setEstado(option.value)}
                        className={`
                          px-4 py-3 rounded-xl border-2 text-left font-medium transition-all duration-200
                          ${estado === option.value
                            ? option.color + ' ring-2 ring-offset-2 ring-black shadow-md'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{option.icon}</span>
                          <span>{option.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Campos para agregar cotización - Solo visible cuando el estado es pendiente_por_cotizacion */}
                {estado === 'pendiente_por_cotizacion' && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      💰 Agregar Cotización
                    </label>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Precio Total
                        </label>
                        <input
                          type="number"
                          value={precioTotal || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setPrecioTotal(value);
                            // Calcular precioFinal automáticamente
                            const final = value - (comisionHotel || 0);
                            setPrecioFinal(Math.max(0, final));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Comisión Hotel (opcional)
                        </label>
                        <input
                          type="number"
                          value={comisionHotel || ''}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value) || 0;
                            setComisionHotel(value);
                            // Recalcular precioFinal
                            const final = (precioTotal || 0) - value;
                            setPrecioFinal(Math.max(0, final));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Precio Final:</span>
                          <span className="font-bold text-gray-900">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0,
                            }).format(precioFinal || 0)}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        💡 Al guardar con estado "Agendada con cotización - Esperando Pago", se enviará un email al cliente con la cotización y podrá proceder con el pago.
                      </p>
                    </div>
                  </div>
                )}

                {/* Conductor Selector - Dropdown */}
                <div ref={dropdownRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conductor Asignado
                  </label>
                  
                  {/* Dropdown Button */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-left flex items-center justify-between hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black transition-all"
                  >
                    {conductorAsignado ? (
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {conductorAsignado
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900 truncate">
                          {conductorAsignado}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Sin asignar</span>
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${
                        isDropdownOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto"
                      >
                      {/* Sin asignar option */}
                      <button
                        type="button"
                        onClick={() => {
                          setConductorAsignado('');
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                          !conductorAsignado ? 'bg-gray-50' : ''
                        }`}
                      >
                        <span className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4" />
                          <span className="font-medium">Sin asignar</span>
                        </span>
                      </button>

                      {/* Conductores list */}
                      {conductores.map((conductor) => {
                        const isSelected = conductorAsignado === conductor.nombre;
                        return (
                          <button
                            key={conductor.id}
                            type="button"
                            onClick={() => {
                              setConductorAsignado(conductor.nombre);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                              isSelected ? 'bg-gray-50' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {conductor.nombre
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 mb-1">
                                  {conductor.nombre}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-1.5 mb-1">
                                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                  <span>{conductor.whatsapp}</span>
                                </p>
                                {conductor.notasAdicionales && (
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {conductor.notasAdicionales}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Actions - Only show when conductor is assigned */}
            {conductorAsignado && selectedConductor && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Acciones
                </h2>
                <div className="space-y-2">
                  <button
                    onClick={handleGenerateImage}
                    disabled={generatingImage}
                    className="w-full py-3 px-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {generatingImage ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Descargar Foto
                      </>
                    )}
                  </button>
                  <a
                    href={`https://wa.me/${selectedConductor.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors text-center flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden component for image generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div
          ref={imageRef}
          style={{
            width: '800px',
            backgroundColor: '#ffffff',
            padding: '40px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div style={{ borderBottom: '4px solid #000', paddingBottom: '20px', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
              Medellín Travel
            </h1>
            <p style={{ fontSize: '18px', color: '#666' }}>
              Información del Servicio - {reserva.codigoReserva}
            </p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#000' }}>
              📍 DIRECCIÓN PRINCIPAL
            </h2>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#000', backgroundColor: '#FEE', padding: '20px', borderRadius: '10px', border: '3px solid #E00' }}>
              {reserva.origen || reserva.lugarRecogida}
            </p>
            {reserva.destino && (
              <p style={{ fontSize: '20px', marginTop: '15px', color: '#333' }}>
                <strong>Destino:</strong> {reserva.destino}
              </p>
            )}
            {reserva.municipio && (
              <p style={{ fontSize: '18px', marginTop: '10px', color: '#666' }}>
                <strong>Municipio:</strong> {reserva.municipio}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
            <div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>📅 Fecha</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                {formatDate(reserva.fecha)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>🕐 Hora</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>{reserva.hora}</p>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>👥 Pasajeros</p>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                {reserva.numeroPasajeros}
              </p>
            </div>
            {reserva.vehiculo && (
              <div>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>🚗 Vehículo</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#000' }}>
                  {reserva.vehiculo.nombre}
                </p>
              </div>
            )}
          </div>

          <div style={{ borderTop: '2px solid #EEE', paddingTop: '20px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
              👤 Contacto del Cliente
            </h3>
            <p style={{ fontSize: '16px', marginBottom: '8px', color: '#333' }}>
              <strong>Nombre:</strong> {reserva.nombreContacto}
            </p>
            <p style={{ fontSize: '16px', marginBottom: '8px', color: '#333' }}>
              <strong>Teléfono:</strong> {reserva.telefonoContacto}
            </p>
            <p style={{ fontSize: '16px', color: '#333' }}>
              <strong>Email:</strong> {reserva.emailContacto}
            </p>
          </div>

          {/* Personas Asistentes */}
          {reserva.personasAsistentes && reserva.personasAsistentes.length > 0 && (
            <div style={{ borderTop: '2px solid #EEE', paddingTop: '20px', marginTop: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '15px', color: '#000' }}>
                👥 Personas Asistentes ({reserva.personasAsistentes.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                {reserva.personasAsistentes.map((persona: any, index: number) => (
                  <div 
                    key={index}
                    style={{ 
                      backgroundColor: '#F9F9F9', 
                      padding: '15px', 
                      borderRadius: '8px', 
                      border: '1px solid #DDD',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px'
                    }}
                  >
                    <span style={{ 
                      fontWeight: 'bold',
                      fontSize: '18px',
                      color: '#333',
                      minWidth: '25px'
                    }}>
                      {index + 1}.
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#000', marginBottom: '4px' }}>
                        {typeof persona === 'string' ? persona : persona.name || persona.nombre || 'Sin nombre'}
                      </p>
                      {typeof persona === 'object' && persona.edad && (
                        <p style={{ fontSize: '14px', color: '#666' }}>
                          {persona.edad} años
                        </p>
                      )}
                      {typeof persona === 'object' && (persona.identificationNumber || persona.documento) && (
                        <p style={{ fontSize: '14px', color: '#666', fontFamily: 'monospace', marginTop: '4px' }}>
                          Doc: {persona.identificationNumber || persona.documento}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reserva.notasCliente && (
            <div style={{ backgroundColor: '#FFF9E6', padding: '20px', borderRadius: '10px', border: '2px solid #FFD700', marginTop: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px', color: '#000' }}>
                📝 Notas del Cliente
              </h3>
              <p style={{ fontSize: '16px', color: '#333', whiteSpace: 'pre-wrap' }}>
                {reserva.notasCliente}
              </p>
            </div>
          )}

          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '2px solid #000', textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Código de Reserva: <strong>{reserva.codigoReserva}</strong>
            </p>
            <p style={{ fontSize: '14px', color: '#666', marginTop: '5px' }}>
              WhatsApp: +57 317 517 7409
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

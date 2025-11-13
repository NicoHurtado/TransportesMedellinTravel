'use client';

import { useState, useEffect } from 'react';
import { useHotel } from '@/contexts/HotelContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  X,
  AlertCircle,
  CheckCircle,
  Package,
  Phone,
  Mail,
  User,
} from 'lucide-react';

interface ReservaHotel {
  id: number;
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  numeroPasajeros: number;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  precioFinal: number;
  estado: string;
  origen?: string;
  destino?: string;
  lugarRecogida?: string;
  createdAt: string;
}

export default function HotelServiciosPage() {
  const { isHotel, hotelId, hotelName } = useHotel();
  const { t } = useLanguage();
  const router = useRouter();
  const [reservas, setReservas] = useState<ReservaHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReserva, setSelectedReserva] = useState<ReservaHotel | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [tarifaCancelacion, setTarifaCancelacion] = useState<number | null>(null);
  const [horasAntes, setHorasAntes] = useState<number | null>(null);

  useEffect(() => {
    if (!isHotel || !hotelId) {
      router.push('/');
      return;
    }
    fetchReservas();
    fetchTarifaCancelacion();
  }, [isHotel, hotelId, router]);

  const fetchTarifaCancelacion = async () => {
    try {
      const response = await fetch(`/api/hoteles/${hotelId}`);
      const data = await response.json();
      if (data.success && data.data.tarifaCancelacion) {
        setTarifaCancelacion(Number(data.data.tarifaCancelacion));
      }
    } catch (error) {
      console.error('Error fetching tarifa cancelación:', error);
    }
  };

  const fetchReservas = async () => {
    try {
      const response = await fetch(`/api/hoteles/${hotelId}/reservas`);
      const data = await response.json();
      if (data.success) {
        setReservas(data.data);
      }
    } catch (error) {
      console.error('Error fetching reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularHorasAntes = (fecha: string, hora: string): number => {
    const fechaHoraServicio = new Date(`${fecha}T${hora}`);
    const ahora = new Date();
    const diffMs = fechaHoraServicio.getTime() - ahora.getTime();
    const diffHoras = diffMs / (1000 * 60 * 60);
    return diffHoras;
  };

  const puedeCancelar = (reserva: ReservaHotel): boolean => {
    const horasAntesServicio = calcularHorasAntes(reserva.fecha, reserva.hora);
    return horasAntesServicio > 0 && reserva.estado !== 'cancelada' && reserva.estado !== 'completada';
  };

  const tieneTarifaCancelacion = (reserva: ReservaHotel): boolean => {
    const horasAntesServicio = calcularHorasAntes(reserva.fecha, reserva.hora);
    return horasAntesServicio < 24 && horasAntesServicio > 0;
  };

  const handleCancelarClick = (reserva: ReservaHotel) => {
    setSelectedReserva(reserva);
    const horasAntesServicio = calcularHorasAntes(reserva.fecha, reserva.hora);
    setHorasAntes(horasAntesServicio);
    setShowCancelModal(true);
  };

  const handleConfirmarCancelacion = async () => {
    if (!selectedReserva) return;

    setCancelando(true);
    try {
      const response = await fetch('/api/hoteles/cancelar-reserva', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId,
          tipoServicio: selectedReserva.tipoServicio,
          reservaId: selectedReserva.id,
          codigoReserva: selectedReserva.codigoReserva,
        }),
      });

      const data = await response.json();
      if (data.success) {
        await fetchReservas();
        setShowCancelModal(false);
        setSelectedReserva(null);
      } else {
        alert(data.error || 'Error al cancelar la reserva');
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error);
      alert('Error al cancelar la reserva');
    } finally {
      setCancelando(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    const estados: { [key: string]: string } = {
      pendiente_por_cotizacion: 'bg-orange-100 text-orange-700',
      agendada_con_cotizacion: 'bg-blue-100 text-blue-700',
      pagado: 'bg-yellow-100 text-yellow-700',
      asignada: 'bg-purple-100 text-purple-700',
      completada: 'bg-green-100 text-green-700',
      cancelada: 'bg-red-100 text-red-700',
    };
    return estados[estado] || 'bg-gray-100 text-gray-700';
  };

  const getEstadoLabel = (estado: string) => {
    const estados: { [key: string]: string } = {
      pendiente_por_cotizacion: 'Pendiente por cotización',
      agendada_con_cotizacion: 'Agendada con cotización - Esperando Pago',
      pagado: 'Pagado',
      asignada: 'Asignada',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return estados[estado] || estado;
  };

  if (!isHotel || !hotelId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mis Servicios</h1>
              <p className="text-sm text-gray-600 mt-1">Hotel: {hotelName}</p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Volver a servicios
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No tienes servicios reservados</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservas.map((reserva) => {
              const horasAntesServicio = calcularHorasAntes(reserva.fecha, reserva.hora);
              const puedeCancelarReserva = puedeCancelar(reserva);
              const aplicaTarifa = tieneTarifaCancelacion(reserva);

              return (
                <motion.div
                  key={reserva.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="px-3 py-1 rounded-lg bg-gray-100">
                          <span className="font-mono text-sm font-semibold text-gray-900">
                            {reserva.codigoReserva}
                          </span>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getEstadoColor(reserva.estado)}`}>
                          {getEstadoLabel(reserva.estado)}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Servicio</p>
                          <p className="font-semibold text-gray-900">{reserva.nombreServicio}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Fecha y Hora</p>
                          <p className="font-semibold text-gray-900">
                            {new Date(reserva.fecha).toLocaleDateString('es-ES')} - {reserva.hora}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Pasajeros</p>
                          <p className="font-semibold text-gray-900">{reserva.numeroPasajeros}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Precio Final</p>
                          <p className="font-semibold text-gray-900">
                            {new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0,
                            }).format(reserva.precioFinal)}
                          </p>
                        </div>
                        {(reserva.origen || reserva.lugarRecogida) && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Origen</p>
                            <p className="font-semibold text-gray-900">
                              {reserva.origen || reserva.lugarRecogida}
                            </p>
                          </div>
                        )}
                        {reserva.destino && (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Destino</p>
                            <p className="font-semibold text-gray-900">{reserva.destino}</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-sm text-gray-500 mb-2">Contacto</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span className="text-gray-700">{reserva.nombreContacto}</span>
                          <span className="text-gray-600">{reserva.telefonoContacto}</span>
                          <span className="text-gray-600">{reserva.emailContacto}</span>
                        </div>
                      </div>

                      {horasAntesServicio > 0 && horasAntesServicio < 24 && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-800">
                            ⚠️ Cancelación dentro de 24 horas aplica tarifa de cancelación
                            {tarifaCancelacion && `: ${new Intl.NumberFormat('es-CO', {
                              style: 'currency',
                              currency: 'COP',
                              minimumFractionDigits: 0,
                            }).format(tarifaCancelacion)}`}
                          </p>
                        </div>
                      )}
                    </div>

                    {puedeCancelarReserva && (
                      <button
                        onClick={() => handleCancelarClick(reserva)}
                        className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium whitespace-nowrap"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Confirmación de Cancelación */}
      {showCancelModal && selectedReserva && (() => {
        const horasAntesServicio = calcularHorasAntes(selectedReserva.fecha, selectedReserva.hora);
        const aplicaTarifa = tieneTarifaCancelacion(selectedReserva);
        
        return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Confirmar Cancelación</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedReserva(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas cancelar la reserva{' '}
                <span className="font-mono font-semibold">{selectedReserva.codigoReserva}</span>?
              </p>

              {aplicaTarifa && tarifaCancelacion && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 font-medium mb-2">
                    ⚠️ Tarifa de Cancelación Aplicable
                  </p>
                  <p className="text-sm text-yellow-700">
                    Al cancelar dentro de las 24 horas antes del servicio, se aplicará una tarifa de cancelación de:
                  </p>
                  <p className="text-lg font-bold text-yellow-900 mt-2">
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                      minimumFractionDigits: 0,
                    }).format(tarifaCancelacion)}
                  </p>
                  {horasAntesServicio && (
                    <p className="text-xs text-yellow-600 mt-2">
                      Tiempo restante: {Math.floor(horasAntesServicio)} horas antes del servicio
                    </p>
                  )}
                </div>
              )}

              {!aplicaTarifa && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Cancelación sin tarifa (más de 24 horas antes del servicio)
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedReserva(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={cancelando}
                >
                  No cancelar
                </button>
                <button
                  onClick={handleConfirmarCancelacion}
                  disabled={cancelando}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelando ? 'Cancelando...' : 'Sí, cancelar'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
        );
      })()}
    </div>
  );
}


'use client';

import { motion } from 'framer-motion';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Phone,
  Mail,
  DollarSign,
  Car,
  User,
  Globe,
  Building,
} from 'lucide-react';

interface UnifiedReservation {
  id: string;
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: Date | string;
  hora?: Date | string;
  numeroPasajeros?: number;
  nombreContacto: string;
  telefonoContacto?: string;
  emailContacto?: string;
  precioTotal?: number;
  precioFinal?: number;
  estado: string;
  hotel?: string | null;
  conductorAsignado?: string | null;
  vehiculoAsignado?: string | null;
  createdAt: Date | string;
  origen?: string;
  destino?: string;
  lugarRecogida?: string;
  vehiculo?: string;
  canal?: string;
  idioma?: string;
  numero_contacto?: string;
  cotizacion?: string;
  estado_servicio?: string;
  estado_pago?: string;
  servicio?: string;
  fuente: 'nueva' | 'antigua';
  rawData?: any;
}

interface UnifiedReservationDetailProps {
  reservation: UnifiedReservation;
  onClose: () => void;
}

export default function UnifiedReservationDetail({ reservation, onClose }: UnifiedReservationDetailProps) {
  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-CO', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: Date | string) => {
    if (!time) return '-';
    const t = time instanceof Date ? time : new Date(time);
    return t.toLocaleTimeString('es-CO', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount?: number | string) => {
    if (!amount) return '-';
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[90%] md:w-[80%] lg:w-[600px] xl:max-w-2xl bg-white z-50 overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold truncate">Detalle de Reserva</h2>
            <p className="text-xs sm:text-sm text-gray-600 truncate">
              #{reservation.codigoReserva} 
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded text-xs">
                {reservation.fuente === 'nueva' ? 'Nueva' : 'Antigua'}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors flex-shrink-0 ml-2"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Summary */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Resumen</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Servicio</p>
                <p className="font-medium">{reservation.nombreServicio}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha</p>
                  <p className="font-medium">{formatDate(reservation.fecha)}</p>
                </div>
                {reservation.hora && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Hora</p>
                    <p className="font-medium">{formatTime(reservation.hora)}</p>
                  </div>
                )}
              </div>
              {reservation.numeroPasajeros && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pasajeros</p>
                  <p className="font-medium">{reservation.numeroPasajeros} personas</p>
                </div>
              )}
              {reservation.canal && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Canal</p>
                  <p className="font-medium">{reservation.canal}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-1">Estado</p>
                <p className="font-medium">{reservation.estado}</p>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Cliente</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nombre</p>
                <p className="font-medium">{reservation.nombreContacto}</p>
              </div>
              {(reservation.telefonoContacto || reservation.numero_contacto) && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{reservation.telefonoContacto || reservation.numero_contacto}</span>
                </div>
              )}
              {reservation.emailContacto && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{reservation.emailContacto}</span>
                </div>
              )}
              {reservation.idioma && (
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">Idioma: {reservation.idioma}</span>
                </div>
              )}
            </div>
          </div>

          {/* Route/Location */}
          {(reservation.origen || reservation.destino || reservation.lugarRecogida) && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Ubicación</h3>
              <div className="space-y-4">
                {reservation.origen && (
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Origen</p>
                      <p className="font-medium">{reservation.origen}</p>
                    </div>
                  </div>
                )}
                {reservation.destino && (
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Destino</p>
                      <p className="font-medium">{reservation.destino}</p>
                    </div>
                  </div>
                )}
                {reservation.lugarRecogida && (
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Lugar de Recogida</p>
                      <p className="font-medium">{reservation.lugarRecogida}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Pricing */}
          {(reservation.precioTotal || reservation.precioFinal || reservation.cotizacion) && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Precios</h3>
              <div className="space-y-3">
                {reservation.precioTotal && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Precio Total</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-xl font-semibold">{formatCurrency(reservation.precioTotal)}</span>
                    </div>
                  </div>
                )}
                {reservation.precioFinal && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Precio Final</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-xl font-semibold">{formatCurrency(reservation.precioFinal)}</span>
                    </div>
                  </div>
                )}
                {reservation.cotizacion && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cotización</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <span className="text-xl font-semibold">{reservation.cotizacion}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Driver & Vehicle */}
          {(reservation.conductorAsignado || reservation.vehiculoAsignado || reservation.vehiculo) && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Conductor & Vehículo</h3>
              <div className="space-y-2">
                {reservation.conductorAsignado && (
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{reservation.conductorAsignado}</span>
                  </div>
                )}
                {(reservation.vehiculoAsignado || reservation.vehiculo) && (
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">{reservation.vehiculoAsignado || reservation.vehiculo}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Hotel */}
          {reservation.hotel && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Hotel</h3>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{reservation.hotel}</span>
              </div>
            </div>
          )}

          {/* Additional Info for Old Reservations */}
          {reservation.fuente === 'antigua' && (
            <>
              {reservation.estado_servicio && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">Estado del Servicio</h3>
                  <p className="text-sm">{reservation.estado_servicio}</p>
                </div>
              )}
              {reservation.estado_pago && (
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold mb-4">Estado de Pago</h3>
                  <p className="text-sm">{reservation.estado_pago}</p>
                </div>
              )}
            </>
          )}

          {/* Raw Data (for debugging/admin) */}
          {reservation.rawData && process.env.NODE_ENV === 'development' && (
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="font-semibold mb-4">Datos Completos (Debug)</h3>
              <pre className="text-xs overflow-auto bg-white p-4 rounded-lg border border-gray-200">
                {JSON.stringify(reservation.rawData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}


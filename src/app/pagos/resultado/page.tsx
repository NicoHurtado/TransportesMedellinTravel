'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Loader2, AlertCircle } from 'lucide-react';

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'approved' | 'rejected' | 'pending' | 'error'>('loading');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [reservationData, setReservationData] = useState<any>(null);
  const [loadingReservation, setLoadingReservation] = useState(true);

  useEffect(() => {
    const boldOrderId = searchParams.get('bold-order-id');
    const boldTxStatus = searchParams.get('bold-tx-status');

    if (!boldOrderId) {
      setStatus('error');
      return;
    }

    setOrderId(boldOrderId);

    if (boldTxStatus) {
      switch (boldTxStatus.toLowerCase()) {
        case 'approved':
          setStatus('approved');
          // Enviar email de confirmación de pago cuando el estado sea approved
          sendPaymentConfirmationEmail(boldOrderId, boldTxStatus);
          break;
        case 'rejected':
          setStatus('rejected');
          break;
        case 'pending':
          setStatus('pending');
          break;
        default:
          setStatus('error');
      }
    } else {
      setStatus('error');
    }

    // Buscar la reserva cuando tengamos el orderId
    // IMPORTANTE: Solo actualizar el estado a "pagado" si el pago fue aprobado
    if (boldOrderId) {
      if (boldTxStatus === 'approved') {
        // Si el pago fue aprobado, cargar y actualizar el estado a "pagado"
        loadReservationData(boldOrderId, true);
      } else {
        // Si el pago no fue aprobado (rejected, pending, o sin estado), solo cargar los datos sin actualizar
        // El estado permanecerá en "agendada_con_cotizacion" o el que tenga actualmente
        loadReservationData(boldOrderId, false);
      }
    } else {
      setLoadingReservation(false);
    }
  }, [searchParams]);

  // Función para actualizar el estado de la reserva a "pagado"
  const updateReservationStatusToPaid = async (codigoReserva: string) => {
    try {
      const response = await fetch('/api/bold/update-reservation-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codigoReserva,
          estado: 'pagado',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error al actualizar estado de reserva:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('✅ Estado de reserva actualizado a "pagado":', result);
      return true;
    } catch (error) {
      console.error('❌ Error al actualizar estado de reserva:', error);
      return false;
    }
  };

  // Función para cargar los datos de la reserva
  const loadReservationData = async (boldOrderId: string, shouldUpdateStatus: boolean = true) => {
    try {
      setLoadingReservation(true);
      
      // Estrategia 1: Buscar el codigoReserva usando el mapeo boldOrderId -> codigoReserva
      let codigoReserva = sessionStorage.getItem(`boldOrderId_${boldOrderId}`);
      
      // Estrategia 2: Si no está en el mapeo, intentar con lastReservationCode
      if (!codigoReserva) {
        codigoReserva = sessionStorage.getItem('lastReservationCode');
      }
      
      // Estrategia 3: Buscar en localStorage (más persistente que sessionStorage)
      if (!codigoReserva && typeof window !== 'undefined') {
        codigoReserva = localStorage.getItem(`boldOrderId_${boldOrderId}`) || localStorage.getItem('lastReservationCode');
      }
      
      // Estrategia 4: Si aún no tenemos codigoReserva, intentar buscar por boldOrderId en la URL
      // o mostrar un mensaje indicando que se puede buscar manualmente
      if (!codigoReserva) {
        console.warn('⚠️ No se encontró codigoReserva en sessionStorage/localStorage para boldOrderId:', boldOrderId);
        console.warn('📋 SessionStorage keys:', Object.keys(sessionStorage).filter(k => k.includes('bold') || k.includes('Reservation')));
        console.warn('📋 LocalStorage keys:', Object.keys(localStorage).filter(k => k.includes('bold') || k.includes('Reservation')));
        
        // Intentar buscar todas las reservas recientes del usuario (última opción)
        // Por ahora, solo mostramos el mensaje de que el pago fue exitoso
        setLoadingReservation(false);
        return;
      }

      console.log('🔍 Buscando reserva con codigoReserva:', codigoReserva);

      // PRIMERO actualizar el estado de la reserva a "pagado" cuando el pago es aprobado
      if (shouldUpdateStatus) {
        await updateReservationStatusToPaid(codigoReserva);
        // Esperar un momento para que la BD se actualice
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // DESPUÉS buscar la reserva en el backend (con el estado actualizado)
      const response = await fetch(`/api/tracking/${codigoReserva}`);
      const data = await response.json();

      if (data.success && data.data) {
        setReservationData(data.data);
        console.log('✅ Reserva encontrada con estado actualizado:', {
          codigoReserva: data.data.codigoReserva,
          estado: data.data.estado,
          estadoEsperado: shouldUpdateStatus ? 'pagado' : 'agendada_con_cotizacion'
        });
      } else {
        console.warn('⚠️ No se encontró la reserva en el backend:', data);
        // Intentar buscar por otros medios si es necesario
      }
    } catch (error) {
      console.error('❌ Error al cargar datos de la reserva:', error);
    } finally {
      setLoadingReservation(false);
    }
  };

  // Función para enviar email de confirmación de pago
  const sendPaymentConfirmationEmail = async (boldOrderId: string, boldTxStatus: string) => {
    if (boldTxStatus.toLowerCase() !== 'approved') return;

    try {
      // Buscar el codigoReserva usando múltiples estrategias
      let codigoReserva = sessionStorage.getItem(`boldOrderId_${boldOrderId}`);
      
      // Estrategia 2: Si no está en el mapeo, intentar con lastReservationCode
      if (!codigoReserva) {
        codigoReserva = sessionStorage.getItem('lastReservationCode');
      }
      
      // Estrategia 3: Buscar en localStorage (más persistente)
      if (!codigoReserva && typeof window !== 'undefined') {
        codigoReserva = localStorage.getItem(`boldOrderId_${boldOrderId}`) || localStorage.getItem('lastReservationCode');
      }
      
      if (!codigoReserva) {
        console.warn('⚠️ No se encontró codigoReserva para boldOrderId:', boldOrderId);
        console.warn('⚠️ SessionStorage disponible:', {
          boldOrderId_mapped: sessionStorage.getItem(`boldOrderId_${boldOrderId}`),
          lastReservationCode: sessionStorage.getItem('lastReservationCode'),
          allKeys: Object.keys(sessionStorage).filter(k => k.includes('bold') || k.includes('Reservation'))
        });
        console.warn('⚠️ LocalStorage disponible:', {
          boldOrderId_mapped: localStorage.getItem(`boldOrderId_${boldOrderId}`),
          lastReservationCode: localStorage.getItem('lastReservationCode'),
          allKeys: Object.keys(localStorage).filter(k => k.includes('bold') || k.includes('Reservation'))
        });
        return;
      }

      console.log('📧 Enviando email de confirmación de pago...', {
        boldOrderId,
        codigoReserva,
        boldTxStatus
      });

      const response = await fetch('/api/bold/send-payment-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boldOrderId,
          codigoReserva,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error al enviar email de confirmación de pago:', errorData);
        return;
      }

      const result = await response.json();
      console.log('✅ Email de confirmación de pago enviado:', result);
      
      // El estado ya se actualiza en loadReservationData, no es necesario actualizarlo aquí de nuevo
    } catch (error) {
      console.error('❌ Error al enviar email de confirmación de pago:', error);
    }
  };

  const handleContinue = () => {
    router.push('/');
  };

  // Función para obtener el nombre del servicio
  const getServiceName = (servicioId: number): string => {
    const serviceNames: { [key: number]: string } = {
      1: 'Transporte Aeropuerto',
      2: 'City Tour',
      3: 'Tour Guatapé',
      4: 'Tour Graffiti',
      5: 'City Tour',
      6: 'Tour Hacienda Nápoles',
      7: 'Tour Occidente',
      8: 'Tour Parapente',
      9: 'Tour ATV',
      10: 'Tour Jardín',
      11: 'Tour Finca Cafetera',
    };
    return serviceNames[servicioId] || 'Servicio';
  };

  // Configuración de estados de reserva
  const estadoConfig: { [key: string]: { icon: any; color: string; label: string; bgColor: string; textColor: string } } = {
    pendiente_por_cotizacion: {
      icon: Clock,
      color: 'text-orange-600 bg-orange-100',
      label: 'Pendiente por Cotización',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
    },
    agendada_con_cotizacion: {
      icon: CheckCircle,
      color: 'text-blue-600 bg-blue-100',
      label: 'Agendada con Cotización - Esperando Pago',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    },
    pagado: {
      icon: CheckCircle,
      color: 'text-yellow-600 bg-yellow-100',
      label: 'Pagado',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
    },
    asignada: {
      icon: CheckCircle,
      color: 'text-purple-600 bg-purple-100',
      label: 'Asignada',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
    },
    completada: {
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
      label: 'Completada',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
    },
    cancelada: {
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
      label: 'Cancelada',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
    },
  };

  const getStatusBadge = () => {
    // Si tenemos datos de la reserva, usar el estado real de la reserva
    if (reservationData && reservationData.estado) {
      const estadoInfo = estadoConfig[reservationData.estado] || estadoConfig.pagado;
      const EstadoIcon = estadoInfo.icon;
      return (
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
          <EstadoIcon className="w-4 h-4 mr-2" />
          {estadoInfo.label}
        </span>
      );
    }
    
    // Si no tenemos datos de reserva, usar el estado del pago de Bold
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <CheckCircle className="w-4 h-4 mr-2" />
            Pagado
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-2" />
            Rechazado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-4 h-4 mr-2" />
            Pendiente
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full"
      >
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-gray-400 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando pago...
            </h2>
            <p className="text-gray-600">
              Por favor espera mientras verificamos el estado de tu transacción.
            </p>
          </div>
        )}

        {status === 'approved' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {reservationData?.estado === 'agendada_con_cotizacion' 
                ? 'Reserva Agendada' 
                : '¡Pago exitoso!'}
            </h2>
            <div className="mb-6">
              {getStatusBadge()}
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              {reservationData?.estado === 'agendada_con_cotizacion'
                ? 'Tu reserva ha sido agendada y está esperando el pago. Completa el pago para confirmar tu reserva.'
                : 'Tu pago ha sido procesado correctamente. Tu reserva está confirmada y recibirás un correo de confirmación.'}
            </p>
            
            {/* Detalles del pago */}
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">💳 Detalles del pago</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de orden Bold:</span>
                    <span className="font-mono text-gray-900">{orderId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen del servicio */}
            {loadingReservation ? (
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  <p className="text-blue-700">Cargando detalles del servicio...</p>
                </div>
              </div>
            ) : reservationData ? (
              <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">📋 Resumen de tu reserva</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start border-b border-blue-200 pb-2">
                    <span className="text-gray-600 font-medium">Código de reserva:</span>
                    <span className="font-mono text-gray-900 font-semibold">{reservationData.codigoReserva}</span>
                  </div>
                  
                  {reservationData.servicioId && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-2">
                      <span className="text-gray-600 font-medium">Servicio:</span>
                      <span className="text-gray-900">{getServiceName(reservationData.servicioId)}</span>
                    </div>
                  )}
                  
                  {reservationData.fecha && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-2">
                      <span className="text-gray-600 font-medium">Fecha:</span>
                      <span className="text-gray-900">
                        {new Date(reservationData.fecha).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                  
                  {reservationData.hora && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-2">
                      <span className="text-gray-600 font-medium">Hora:</span>
                      <span className="text-gray-900">
                        {reservationData.hora instanceof Date
                          ? reservationData.hora.toTimeString().split(' ')[0].substring(0, 5)
                          : reservationData.hora}
                      </span>
                    </div>
                  )}
                  
                  {reservationData.numeroPasajeros && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-2">
                      <span className="text-gray-600 font-medium">Pasajeros:</span>
                      <span className="text-gray-900">{reservationData.numeroPasajeros}</span>
                    </div>
                  )}
                  
                  {(reservationData.lugarRecogida || reservationData.origen) && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-2">
                      <span className="text-gray-600 font-medium">
                        {reservationData.lugarRecogida ? 'Lugar de recogida:' : 'Origen:'}
                      </span>
                      <span className="text-gray-900 text-right">
                        {reservationData.lugarRecogida || reservationData.origen}
                      </span>
                    </div>
                  )}
                  
                  {reservationData.destino && (
                    <div className="flex justify-between items-start border-b border-blue-200 pb-2">
                      <span className="text-gray-600 font-medium">Destino:</span>
                      <span className="text-gray-900 text-right">{reservationData.destino}</span>
                    </div>
                  )}
                  
                  {(reservationData.precioFinal || reservationData.precioTotal) && (
                    <div className="flex justify-between items-start pt-2">
                      <span className="text-gray-900 font-bold">Total pagado:</span>
                      <span className="text-green-600 font-bold text-lg">
                        {new Intl.NumberFormat('es-CO', {
                          style: 'currency',
                          currency: 'COP',
                          minimumFractionDigits: 0,
                        }).format(Number(reservationData.precioFinal || reservationData.precioTotal || 0))}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">Estado:</span>
                      {(() => {
                        const estadoInfo = estadoConfig[reservationData.estado] || estadoConfig.pagado;
                        const EstadoIcon = estadoInfo.icon;
                        return (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
                            <EstadoIcon className="w-4 h-4 mr-1" />
                            {estadoInfo.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                
                {/* Botón para ver tracking */}
                {reservationData.codigoReserva && (
                  <div className="mt-6 pt-4 border-t border-blue-200">
                    <a
                      href={`/tracking/${reservationData.codigoReserva}`}
                      className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                    >
                      🔍 Ver estado de mi reserva
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-yellow-800 text-sm">
                  ⚠️ No se pudieron cargar los detalles de la reserva. Tu pago fue exitoso y recibirás un correo de confirmación.
                </p>
              </div>
            )}
            
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors min-h-[44px]"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {status === 'rejected' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Pago rechazado
            </h2>
            <div className="mb-6">
              {getStatusBadge()}
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              Tu pago no pudo ser procesado. Por favor, intenta nuevamente o contacta con soporte si el problema persiste.
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">ID de orden Bold:</p>
                <p className="text-sm font-mono text-gray-900">{orderId}</p>
              </div>
            )}
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors min-h-[44px]"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {status === 'pending' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Pago pendiente
            </h2>
            <div className="mb-6">
              {getStatusBadge()}
            </div>
            <p className="text-gray-600 mb-6 text-lg">
              Tu pago está siendo procesado. Te notificaremos por correo cuando se confirme la transacción.
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">ID de orden Bold:</p>
                <p className="text-sm font-mono text-gray-900">{orderId}</p>
              </div>
            )}
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors min-h-[44px]"
            >
              Volver al inicio
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Error al procesar el pago
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {!orderId 
                ? 'No se encontró el ID de orden en la URL. Por favor, verifica que hayas completado el proceso de pago correctamente.'
                : 'No se pudo determinar el estado del pago. Por favor, contacta con soporte proporcionando el ID de orden.'}
            </p>
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">ID de orden Bold:</p>
                <p className="text-sm font-mono text-gray-900">{orderId}</p>
              </div>
            )}
            <button
              onClick={handleContinue}
              className="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors min-h-[44px]"
            >
              Volver al inicio
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    }>
      <PaymentResultContent />
    </Suspense>
  );
}


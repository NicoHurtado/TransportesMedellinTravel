'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getBaseUrl, getPaymentResultUrl } from '@/lib/url';
import { 
  CheckCircle, 
  Clock, 
  Package, 
  Truck, 
  X,
  MapPin,
  Calendar,
  Users,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface ReservaTracking {
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  numeroPasajeros: number;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  precioFinal: number | null;
  precioTotal?: number | null;
  estado: string;
  conductorAsignado?: string;
  vehiculoAsignado?: string;
  hotel?: {
    id: number;
    nombre: string;
    tarifaCancelacion?: number | null;
  };
  hotelId?: number | null;
  vehiculo?: {
    nombre: string;
  };
  origen?: string;
  destino?: string;
  lugarRecogida?: string;
  personasAsistentes?: any[];
  createdAt: string;
  id?: number;
}

const estadoConfig: { [key: string]: { icon: any; color: string; label: string; description: string } } = {
  pendiente_por_cotizacion: {
    icon: Clock,
    color: 'text-orange-600 bg-orange-100',
    label: 'Pendiente por Cotización',
    description: 'Tu reserva ha sido recibida y está siendo procesada',
  },
  agendada_con_cotizacion: {
    icon: CheckCircle,
    color: 'text-blue-600 bg-blue-100',
    label: 'Agendada con Cotización - Esperando Pago',
    description: 'Tu reserva ha sido agendada y está esperando el pago',
  },
  pagado: {
    icon: CheckCircle,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Pagado',
    description: 'Tu pago ha sido procesado exitosamente. Tu reserva está confirmada.',
  },
  asignada: {
    icon: Truck,
    color: 'text-purple-600 bg-purple-100',
    label: 'Asignada',
    description: 'Un conductor ha sido asignado a tu servicio',
  },
  completada: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    label: 'Completada',
    description: 'Tu servicio ha sido completado exitosamente',
  },
  cancelada: {
    icon: X,
    color: 'text-red-600 bg-red-100',
    label: 'Cancelada',
    description: 'Esta reserva ha sido cancelada',
  },
  // Mantener compatibilidad con estados antiguos
  pendiente: {
    icon: Clock,
    color: 'text-orange-600 bg-orange-100',
    label: 'Pendiente por Cotización',
    description: 'Tu reserva ha sido recibida y está siendo procesada',
  },
  confirmada: {
    icon: CheckCircle,
    color: 'text-blue-600 bg-blue-100',
    label: 'Agendada con Cotización',
    description: 'Tu reserva ha sido confirmada',
  },
};

function TrackingPageContent() {
  const params = useParams();
  const [reserva, setReserva] = useState<ReservaTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Estados para Bold
  const [boldHash, setBoldHash] = useState<string | null>(null);
  const [boldOrderId, setBoldOrderId] = useState<string | null>(null);
  const [isLoadingHash, setIsLoadingHash] = useState(false);
  const boldButtonRef = useRef<HTMLDivElement>(null);
  // Estados para cancelación de hotel
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        // Verificar que params y params.code existan
        if (!params || !params.code) {
          console.error('❌ Params o code no disponible');
          setError(true);
          setLoading(false);
          return;
        }

        const code = Array.isArray(params.code) ? params.code[0] : params.code;
        const response = await fetch(`/api/tracking/${code}`);
        const data = await response.json();

        if (data.success) {
          console.log('======= DATOS DE RESERVA RECIBIDOS =======');
          console.log('precioFinal:', data.data.precioFinal);
          console.log('estado:', data.data.estado);
          console.log('tipo:', typeof data.data.precioFinal);
          console.log('hotel:', data.data.hotel);
          console.log('hotelId:', data.data.hotelId);
          console.log('fecha:', data.data.fecha);
          console.log('hora:', data.data.hora);
          console.log('==========================================');
          setReserva(data.data);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching tracking:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTracking();
  }, [params]);

  // Generar hash de Bold cuando el estado es agendada_con_cotizacion y hay precio
  // IMPORTANTE: NO generar hash si es una reserva de hotel (hoteles pagan en efectivo)
  useEffect(() => {
    const generateBoldHash = async () => {
      if (!reserva || reserva.estado !== 'agendada_con_cotizacion' || isLoadingHash || boldHash) return;
      if (!params || !params.code) return;
      
      // NO generar hash de Bold si es una reserva de hotel (hoteles pagan en efectivo)
      if (reserva.hotel) {
        console.log('🏨 Reserva de hotel detectada - No se generará botón de Bold (pago en efectivo)');
        return;
      }
      
      const priceToUse = reserva.precioFinal || reserva.precioTotal || 0;
      if (priceToUse <= 0) return;

      setIsLoadingHash(true);
      
      // Generar orderId único
      const timestamp = Date.now();
      const orderId = `RES-${timestamp}`;
      
      // Calcular amount: entero, sin decimales, mínimo 1000 COP
      const amount = Math.max(1000, Math.round(priceToUse));
      
      if (amount < 1000 || !Number.isInteger(amount)) {
        console.error('❌ Amount inválido para Bold:', { amount, priceToUse });
        setIsLoadingHash(false);
        return;
      }
      
      setBoldOrderId(orderId);
      
      // Guardar en sessionStorage y localStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('boldAmount', amount.toString());
        sessionStorage.setItem('boldOrderId', orderId);
        sessionStorage.setItem(`boldOrderId_${orderId}`, reserva.codigoReserva);
        localStorage.setItem('boldAmount', amount.toString());
        localStorage.setItem('boldOrderId', orderId);
        localStorage.setItem(`boldOrderId_${orderId}`, reserva.codigoReserva);
        localStorage.setItem('lastReservationCode', reserva.codigoReserva);
      }

      try {
        const response = await fetch('/api/bold/generate-hash', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount: amount,
            currency: 'COP',
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error response from API:', errorData);
          throw new Error(errorData.error || 'Error generating hash');
        }
        
        const result = await response.json();
        
        if (result.hash) {
          console.log('Bold hash generated successfully:', {
            orderId,
            amount,
            currency: 'COP',
            hash: result.hash.substring(0, 20) + '...'
          });
          setBoldHash(result.hash);
        } else {
          console.error('No hash in response:', result);
        }
      } catch (error) {
        console.error('Error generating Bold hash:', error);
      } finally {
        setIsLoadingHash(false);
      }
    };

    generateBoldHash();
  }, [reserva, isLoadingHash, boldHash]);

  // Crear el botón de Bold cuando el hash esté listo
  // IMPORTANTE: NO crear botón si es una reserva de hotel (hoteles pagan en efectivo)
  useEffect(() => {
    if (!boldHash || !boldOrderId || !boldButtonRef.current || !reserva) return;
    if (reserva.estado !== 'agendada_con_cotizacion') return;
    
    // NO crear botón de Bold si es una reserva de hotel (hoteles pagan en efectivo)
    if (reserva.hotel) {
      console.log('🏨 Reserva de hotel detectada - No se creará botón de Bold (pago en efectivo)');
      return;
    }

    const priceToUse = reserva.precioFinal || reserva.precioTotal || 0;
    if (priceToUse <= 0) return;

    const checkBoldScript = () => {
      const boldScriptLoaded = typeof window !== 'undefined' && 
        (document.querySelector('script[src*="boldPaymentButton"]') !== null ||
         (window as any).BoldPaymentButton !== undefined);
      
      if (!boldScriptLoaded) {
        setTimeout(checkBoldScript, 100);
        return;
      }

      createButton();
    };

    const createButton = () => {
      if (!boldButtonRef.current) return;
      boldButtonRef.current.innerHTML = '';

      // Usar la llave de identidad de prueba del tab "Botón de pagos"
      // IMPORTANTE: Esta debe ser la llave del tab "Botón de pagos", NO la de "API Integrations"
      const expectedApiKey = 'nlFAEO2PDp9Pe2m3gZo5AepFKLWjg_9jpxhajnXkmbA';
      // Intentar obtener de process.env, si no está disponible usar el valor esperado como fallback
      const apiKey = (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST) 
        ? process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST 
        : expectedApiKey;
      
      // Log detallado para debugging
      console.log('🔑 API Key Check (Tracking):', {
        fromEnv: apiKey,
        fromEnvType: typeof apiKey,
        fromEnvLength: apiKey?.length || 0,
        expected: expectedApiKey,
        matches: apiKey === expectedApiKey,
        isEmpty: !apiKey,
        isUndefined: apiKey === undefined,
        isNull: apiKey === null,
        trimmed: apiKey?.trim() || '',
        allEnvKeys: typeof window !== 'undefined' ? Object.keys(process.env).filter(k => k.includes('BOLD')) : []
      });
      
      // Verificar que apiKey esté disponible y no esté vacío
      if (!apiKey || apiKey.trim() === '') {
        console.error('❌ NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST no está configurada o está vacía');
        console.error('❌ Verifica que la variable esté en .env.local o .env');
        console.error('❌ Asegúrate de que el servidor de desarrollo se haya reiniciado después de agregar la variable');
        console.error('❌ Valor actual de apiKey:', apiKey);
        return;
      }
      
      if (apiKey !== expectedApiKey) {
        console.warn('⚠️ API Key no coincide con la esperada:', {
          actual: apiKey,
          expected: expectedApiKey,
          actualLength: apiKey.length,
          expectedLength: expectedApiKey.length
        });
      }

      // Obtener amount y orderId de sessionStorage para asegurar consistencia
      const amountStr = sessionStorage.getItem('boldAmount') || Math.max(1000, Math.round(priceToUse)).toString();
      const orderId = sessionStorage.getItem('boldOrderId') || boldOrderId;
      const amount = parseInt(amountStr);

      if (!orderId || amount < 1000) {
        console.error('❌ Datos inválidos para Bold:', { orderId, amount });
        return;
      }

      const baseUrl = getBaseUrl();
      let redirectionUrl: string | null = null;
      
      // IMPORTANTE: Bold NO acepta http://localhost en data-redirection-url
      // Para desarrollo local, NO configurar data-redirection-url (Bold redirige a la página actual)
      // El interceptor en page.tsx capturará los parámetros y redirigirá a /pagos/resultado
      if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        // Para desarrollo local, NO configurar data-redirection-url
        // Bold redirigirá a la página actual y el interceptor manejará la redirección
        redirectionUrl = null;
        console.log('🔧 Desarrollo local: NO se configurará data-redirection-url (Bold redirige a página actual)');
      } else {
        // Para producción, usar la URL completa
        redirectionUrl = getPaymentResultUrl();
        console.log('🔧 Configurando redirection URL para producción:', redirectionUrl);
      }

      // Verificar que apiKey no esté vacío antes de crear el script
      if (!apiKey || apiKey.trim() === '') {
        console.error('❌ [BOLD CONFIG] apiKey está vacío o undefined. No se creará el botón.');
        console.error('❌ Verifica que NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST esté en .env y que el servidor se haya reiniciado');
        return;
      }

      // IMPORTANTE: Siempre incluir src para que Bold procese el script
      // El navegador ignorará la carga duplicada si ya está cargado, pero Bold necesita el src
      const script = document.createElement('script');
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      script.async = true;
      
      // Verificar si el script ya está cargado para logging
      const boldScriptAlreadyLoaded = typeof window !== 'undefined' && 
        (document.querySelector('script[src*="boldPaymentButton"]') !== null ||
         (window as any).BoldPaymentButton !== undefined);
      
      if (boldScriptAlreadyLoaded) {
        console.log('✅ Script de Bold ya está cargado, pero incluyendo src para que Bold lo procese');
      } else {
        console.log('📦 Cargando script de Bold dinámicamente');
      }
      
      // Atributos obligatorios cuando hay amount
      script.setAttribute('data-bold-button', 'dark-L');
      script.setAttribute('data-api-key', apiKey.trim()); // Asegurar que no tenga espacios
      script.setAttribute('data-order-id', orderId);
      script.setAttribute('data-amount', amountStr);
      script.setAttribute('data-currency', 'COP');
      script.setAttribute('data-integrity-signature', boldHash);
      script.setAttribute('data-description', `Pago de reserva: ${reserva.nombreServicio}`);
      
      // Solo configurar data-redirection-url si NO estamos en localhost
      if (redirectionUrl) {
        script.setAttribute('data-redirection-url', redirectionUrl);
        console.log('✅ Redirection URL configurada:', redirectionUrl);
      } else {
        console.log('ℹ️ No se configuró data-redirection-url (desarrollo local - Bold redirige a página actual)');
      }
      
      // Verificar que todos los atributos se hayan establecido correctamente
      const apiKeyAttr = script.getAttribute('data-api-key');
      console.log('📋 Script attributes before append (Tracking):', {
        'data-bold-button': script.getAttribute('data-bold-button'),
        'data-api-key': apiKeyAttr?.substring(0, 20) + '...',
        'data-api-key-full': apiKeyAttr, // MOSTRAR COMPLETA PARA DEBUGGING
        'data-api-key-length': apiKeyAttr?.length,
        'data-api-key-expected': expectedApiKey,
        'data-api-key-matches': apiKeyAttr === expectedApiKey,
        'data-order-id': script.getAttribute('data-order-id'),
        'data-amount': script.getAttribute('data-amount'),
        'data-currency': script.getAttribute('data-currency'),
        'data-integrity-signature': script.getAttribute('data-integrity-signature')?.substring(0, 10) + '...',
        'data-description': script.getAttribute('data-description'),
        'data-redirection-url': script.getAttribute('data-redirection-url') || '(no configurada - usando URL por defecto)',
        'src': script.src
      });
      
      // Verificar que todos los atributos obligatorios estén presentes
      const requiredAttrs = ['data-bold-button', 'data-api-key', 'data-order-id', 'data-amount', 'data-currency', 'data-integrity-signature'];
      const missingAttrs = requiredAttrs.filter(attr => !script.hasAttribute(attr));
      if (missingAttrs.length > 0) {
        console.error('❌ FALTAN ATRIBUTOS OBLIGATORIOS:', missingAttrs);
      } else {
        console.log('✅ Todos los atributos obligatorios están presentes');
      }

      // Datos del cliente
      if (reserva.emailContacto || reserva.nombreContacto || reserva.telefonoContacto) {
        const customerData: any = {};
        if (reserva.emailContacto) customerData.email = reserva.emailContacto;
        if (reserva.nombreContacto) customerData.fullName = reserva.nombreContacto;
        if (reserva.telefonoContacto) {
          customerData.phone = reserva.telefonoContacto.replace(/\D/g, '');
          customerData.dialCode = '+57';
        }
        if (Object.keys(customerData).length > 0) {
          script.setAttribute('data-customer-data', JSON.stringify(customerData));
        }
      }

      console.log('✅ Creando botón Bold en tracking page:', {
        orderId,
        amount: amountStr,
        hash: boldHash.substring(0, 20) + '...',
        redirectionUrl
      });

      boldButtonRef.current.appendChild(script);
    };

    checkBoldScript();
  }, [boldHash, boldOrderId, reserva]);

  // Funciones para cancelación de hotel
  const calcularHorasAntes = (fecha: string | Date, hora: string | Date): number => {
    try {
      let fechaHoraServicio: Date;
      
      // Si fecha y hora son strings (formato ISO o YYYY-MM-DD y HH:MM)
      if (typeof fecha === 'string' && typeof hora === 'string') {
        // Formatear la hora correctamente (asegurar formato HH:MM)
        const horaFormateada = hora.length >= 5 ? hora.substring(0, 5) : hora;
        fechaHoraServicio = new Date(`${fecha}T${horaFormateada}`);
      } 
      // Si fecha es Date y hora es Date
      else if (fecha instanceof Date && hora instanceof Date) {
        fechaHoraServicio = new Date(fecha);
        fechaHoraServicio.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
      }
      // Si fecha es Date y hora es string
      else if (fecha instanceof Date && typeof hora === 'string') {
        fechaHoraServicio = new Date(fecha);
        const horaFormateada = hora.length >= 5 ? hora.substring(0, 5) : hora;
        const [horas, minutos] = horaFormateada.split(':').map(Number);
        fechaHoraServicio.setHours(horas, minutos, 0, 0);
      }
      // Si fecha es string y hora es Date
      else if (typeof fecha === 'string' && hora instanceof Date) {
        fechaHoraServicio = new Date(fecha);
        fechaHoraServicio.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
      }
      else {
        console.error('❌ Formato de fecha/hora no reconocido:', { fecha, hora, tipoFecha: typeof fecha, tipoHora: typeof hora });
        return 0;
      }
      
      const ahora = new Date();
      const diffMs = fechaHoraServicio.getTime() - ahora.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);
      
      console.log('📅 Cálculo de horas:', {
        fechaOriginal: fecha,
        horaOriginal: hora,
        fechaHoraServicio: fechaHoraServicio.toISOString(),
        ahora: ahora.toISOString(),
        diffHoras,
      });
      
      return diffHoras;
    } catch (error) {
      console.error('Error calculando horas antes:', error, { fecha, hora });
      return 0;
    }
  };

  const puedeCancelar = (): boolean => {
    if (!reserva) {
      console.log('❌ No hay reserva');
      return false;
    }
    
    if (!reserva.hotel) {
      console.log('❌ No es reserva de hotel:', { hotel: reserva.hotel });
      return false;
    }
    
    if (reserva.estado === 'cancelada') {
      console.log('❌ Reserva ya cancelada');
      return false;
    }
    
    if (reserva.estado === 'completada') {
      console.log('❌ Reserva ya completada');
      return false;
    }
    
    const horasAntesServicio = calcularHorasAntes(reserva.fecha, reserva.hora);
    console.log('🔍 Verificando cancelación:', {
      estado: reserva.estado,
      horasAntesServicio,
      puedeCancelar: horasAntesServicio > 0,
      fecha: reserva.fecha,
      hora: reserva.hora,
    });
    
    return horasAntesServicio > 0;
  };

  const tieneTarifaCancelacion = (): boolean => {
    if (!reserva) return false;
    const horasAntesServicio = calcularHorasAntes(reserva.fecha, reserva.hora);
    return horasAntesServicio < 24 && horasAntesServicio > 0;
  };

  const handleConfirmarCancelacion = async () => {
    if (!reserva || !reserva.hotel || !reserva.hotelId || !reserva.id) return;

    setCancelando(true);
    try {
      const response = await fetch('/api/hoteles/cancelar-reserva', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: reserva.hotelId,
          tipoServicio: reserva.tipoServicio,
          reservaId: reserva.id,
          codigoReserva: reserva.codigoReserva,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Recargar la reserva para actualizar el estado
        const code = Array.isArray(params.code) ? params.code[0] : params.code;
        const refreshResponse = await fetch(`/api/tracking/${code}`);
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setReserva(refreshData.data);
        }
        setShowCancelModal(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Reserva no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            No pudimos encontrar una reserva con el código proporcionado.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Volver al inicio
          </a>
        </motion.div>
      </div>
    );
  }

  const estadoInfo = estadoConfig[reserva.estado as keyof typeof estadoConfig] || estadoConfig.pendiente_por_cotizacion;
  const EstadoIcon = estadoInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Seguimiento de Reserva
              </h1>
              <p className="text-gray-600">
                Código: <span className="font-mono font-semibold">{reserva.codigoReserva}</span>
              </p>
            </div>
            <div className={`p-4 rounded-full ${estadoInfo.color}`}>
              <EstadoIcon className="w-8 h-8" />
            </div>
          </div>

          {/* Estado */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className={`text-xl font-bold mb-2 ${estadoInfo.color.split(' ')[0]}`}>
              {estadoInfo.label}
            </h3>
            <p className="text-gray-600">{estadoInfo.description}</p>
          </div>
        </motion.div>

        {/* Detalles del Servicio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Detalles del Servicio
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Servicio</p>
                <p className="font-semibold text-gray-900">{reserva.nombreServicio}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Fecha y Hora</p>
                <p className="font-semibold text-gray-900">
                  {new Date(reserva.fecha).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                  {' · '}
                  {reserva.hora}
                </p>
              </div>
            </div>

            {(reserva.origen || reserva.lugarRecogida) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">
                    {reserva.origen ? 'Origen' : 'Lugar de Recogida'}
                  </p>
                  <p className="font-semibold text-gray-900">
                    {reserva.origen || reserva.lugarRecogida}
                  </p>
                  {reserva.destino && (
                    <>
                      <p className="text-sm text-gray-500 mt-2">Destino</p>
                      <p className="font-semibold text-gray-900">{reserva.destino}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Pasajeros</p>
                <p className="font-semibold text-gray-900">{reserva.numeroPasajeros}</p>
              </div>
            </div>

            {reserva.vehiculo && (
              <div className="flex items-start gap-3">
                <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Vehículo</p>
                  <p className="font-semibold text-gray-900">{reserva.vehiculo.nombre}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Información de Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Información de Contacto
          </h2>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-semibold text-gray-900">{reserva.nombreContacto}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-semibold text-gray-900">{reserva.telefonoContacto}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-semibold text-gray-900">{reserva.emailContacto}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Personas Asistentes */}
        {reserva.personasAsistentes && reserva.personasAsistentes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Personas Asistentes ({reserva.personasAsistentes.length})
            </h2>
            <div className="space-y-3">
              {reserva.personasAsistentes.map((persona: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <span className="font-bold text-gray-700 text-lg mt-0.5">
                    {index + 1}.
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      {typeof persona === 'string' ? persona : persona.name || persona.nombre || 'Sin nombre'}
                    </p>
                    {typeof persona === 'object' && persona.edad && (
                      <p className="text-sm text-gray-600 mt-1">
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
          </motion.div>
        )}

        {/* Conductor Asignado */}
        {reserva.conductorAsignado && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl shadow-lg p-8 mb-6 border-2 border-purple-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Conductor Asignado
            </h2>
            <p className="text-lg font-semibold text-purple-900">
              {reserva.conductorAsignado}
            </p>
            {reserva.vehiculoAsignado && (
              <p className="text-gray-700 mt-2">
                Vehículo: {reserva.vehiculoAsignado}
              </p>
            )}
          </motion.div>
        )}

        {/* Precio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${(reserva.precioFinal && Number(reserva.precioFinal) > 0) ? 'bg-black text-white' : 'bg-yellow-50 border-2 border-yellow-200'} rounded-2xl shadow-lg p-8`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={(reserva.precioFinal && Number(reserva.precioFinal) > 0) ? 'text-gray-300 mb-1' : 'text-yellow-800 mb-1'}>
                {(reserva.precioFinal && Number(reserva.precioFinal) > 0) ? 'Precio Total' : 'Estado de Cotización'}
              </p>
              {(reserva.precioFinal && Number(reserva.precioFinal) > 0) ? (
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat('es-CO', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(Number(reserva.precioFinal))}{' '}
                  COP
                </p>
              ) : (
                <p className="text-2xl font-bold text-yellow-900">
                  Pendiente de cotización
                </p>
              )}
            </div>
            {reserva.hotel && (reserva.precioFinal && Number(reserva.precioFinal) > 0) && (
              <div className="text-right">
                <p className="text-gray-300 text-sm">Reservado por</p>
                <p className="font-semibold">{reserva.hotel.nombre}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Botón de Pago Bold - Solo visible cuando el estado es agendada_con_cotizacion y NO es hotel */}
        {reserva.estado === 'agendada_con_cotizacion' && reserva.precioFinal && Number(reserva.precioFinal) > 0 && !reserva.hotel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              💳 Proceder con el Pago
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Tu cotización está lista. Haz clic en el botón de abajo para completar el pago y confirmar tu reserva.
            </p>
            <div className="flex justify-center" ref={boldButtonRef}>
              {isLoadingHash && (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  <span>Preparando botón de pago...</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Mensaje para hoteles - Pago en efectivo */}
        {reserva.estado === 'agendada_con_cotizacion' && reserva.precioFinal && Number(reserva.precioFinal) > 0 && reserva.hotel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              💵 Método de Pago
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Tu reserva ha sido agendada exitosamente. El pago se realizará en <strong>efectivo</strong> al momento del servicio.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-center mb-6">
              <p className="text-sm text-gray-700">
                <strong>Monto a pagar:</strong> {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(Number(reserva.precioFinal))}
              </p>
            </div>
          </motion.div>
        )}

        {/* Botón de Cancelar - Solo para hoteles */}
        {(() => {
          const esHotel = !!reserva.hotel;
          const puedeCancelarReserva = puedeCancelar();
          console.log('🔍 Renderizando botón cancelar:', { 
            esHotel, 
            puedeCancelarReserva, 
            estado: reserva.estado,
            hotel: reserva.hotel,
            fecha: reserva.fecha,
            hora: reserva.hora
          });
          return esHotel && puedeCancelarReserva;
        })() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Cancelar Reserva
              </h2>
              {tieneTarifaCancelacion() && reserva.hotel?.tarifaCancelacion && Number(reserva.hotel.tarifaCancelacion) > 0 ? (
                <div className="mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 font-medium mb-2">
                      ⚠️ Tarifa de Cancelación Aplicable
                    </p>
                    <p className="text-sm text-yellow-700 mb-2">
                      Al cancelar dentro de las 24 horas antes del servicio, se aplicará una tarifa de cancelación de:
                    </p>
                    <p className="text-lg font-bold text-yellow-900">
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                        minimumFractionDigits: 0,
                      }).format(Number(reserva.hotel?.tarifaCancelacion))}
                    </p>
                    {(() => {
                      const horasAntes = calcularHorasAntes(reserva.fecha, reserva.hora);
                      return (
                        <p className="text-xs text-yellow-600 mt-2">
                          Tiempo restante: {Math.floor(horasAntes)} horas antes del servicio
                        </p>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      ✓ Cancelación sin tarifa (más de 24 horas antes del servicio)
                    </p>
                  </div>
                </div>
              )}
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-md"
              >
                Cancelar Reserva
              </button>
            </div>
          </motion.div>
        )}

        {/* Botón volver */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-8 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-md"
          >
            Volver al inicio
          </a>
        </div>
      </div>

      {/* Modal de Confirmación de Cancelación */}
      {showCancelModal && reserva && (() => {
        const horasAntesServicio = calcularHorasAntes(reserva.fecha, reserva.hora);
        const aplicaTarifa = tieneTarifaCancelacion();
        const tarifaCancelacion = reserva.hotel?.tarifaCancelacion ? Number(reserva.hotel.tarifaCancelacion) : null;
        
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
                  onClick={() => setShowCancelModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  ¿Estás seguro de que deseas cancelar la reserva{' '}
                  <span className="font-mono font-semibold">{reserva.codigoReserva}</span>?
                </p>

                {aplicaTarifa && tarifaCancelacion && tarifaCancelacion > 0 && (
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
                    onClick={() => setShowCancelModal(false)}
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

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información de la reserva...</p>
        </div>
      </div>
    }>
      <TrackingPageContent />
    </Suspense>
  );
}



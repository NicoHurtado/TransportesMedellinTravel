'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHotel } from '@/contexts/HotelContext';
import { usePricingData } from '@/hooks/usePricingData';
import { BookingData } from './index';
import { MapPin, Calendar, Clock, Users, User, Phone, Mail, Plane } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { getBaseUrl, getPaymentResultUrl } from '@/lib/url';

interface SummaryProps {
  data: BookingData;
  serviceName: string;
  serviceImage: string;
  serviceId: string;
  onConfirm: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

// All vehicle ranges are now dynamically loaded from the database via usePricingData hook
// No hardcoded ranges - only vehicles configured in the panel for each service will be available

export default function Summary({ data, serviceName, serviceImage, serviceId, onConfirm, onBack, isSubmitting = false }: SummaryProps) {
  const { t, language } = useLanguage();
  const { isHotel, hotelId, hotelCommission, getComisionEspecifica } = useHotel();
  const isCustomTransport = serviceId === 'custom-transport';
  const isTour = serviceId.includes('-tour');
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [boldHash, setBoldHash] = useState<string | null>(null);
  const [boldOrderId, setBoldOrderId] = useState<string | null>(null);
  const [isLoadingHash, setIsLoadingHash] = useState(false);
  const boldButtonRef = useRef<HTMLDivElement>(null);
  
  // Get dynamic pricing data from database
  const { getPrecioVehiculo, getPrecioAdicional, getVehicleRanges: getDynamicVehicleRanges, preciosVehiculos } = usePricingData(serviceId);
  
  // Get the appropriate vehicle ranges dynamically from database
  // Only returns vehicles that have been configured with prices for this service
  const getVehicleRanges = () => {
    return getDynamicVehicleRanges();
  };
  
  // Obtener vehiculoId del vehículo seleccionado
  // Si el usuario seleccionó un upgrade, usar ese vehículo
  // Si no, usar el vehículo que corresponde al número de pasajeros
  let vehiculoIdSeleccionado: number | null = null;
  const vehicleRanges = getVehicleRanges();
  
  if (data.selectedVehicle && vehicleRanges.length > 0) {
    // Buscar el vehículo seleccionado por el usuario (upgrade)
    const selectedVehicle = vehicleRanges.find(v => {
      const matchImage = v.image === data.selectedVehicle;
      const matchVehiculoId = v.vehiculoId?.toString() === data.selectedVehicle;
      return matchImage || matchVehiculoId;
    });
    if (selectedVehicle) {
      vehiculoIdSeleccionado = selectedVehicle.vehiculoId;
    }
  }
  
  // Si no hay vehículo seleccionado explícitamente, buscar por número de pasajeros
  if (!vehiculoIdSeleccionado && data.passengers > 0 && preciosVehiculos.length > 0) {
    // Buscar usando las capacidades reales del vehículo
    const precioVehiculo = preciosVehiculos.find((p) => {
      // Buscar el vehículo para obtener sus capacidades reales
      const vehiculo = vehicleRanges.find(v => v.vehiculoId === p.vehiculoId);
      if (vehiculo) {
        return data.passengers >= vehiculo.min && data.passengers <= vehiculo.max && p.activo;
      }
      // Fallback: usar los rangos del precio si no se encuentra el vehículo
      return data.passengers >= p.pasajerosMin && data.passengers <= p.pasajerosMax && p.activo;
    });
    if (precioVehiculo) {
      vehiculoIdSeleccionado = precioVehiculo.vehiculoId;
    }
  }
  
  // Calcular comisión específica del hotel
  let commissionAmount = 0;
  if (isHotel && hotelId && vehiculoIdSeleccionado && data.totalPrice) {
    const comisionEspecifica = getComisionEspecifica(serviceId, vehiculoIdSeleccionado);
    if (comisionEspecifica > 0) {
      // Si hay comisión específica, usar esa cantidad fija
      commissionAmount = comisionEspecifica;
    } else {
      // Si no hay comisión específica, usar el porcentaje como fallback
      commissionAmount = (data.totalPrice * hotelCommission) / 100;
    }
  }
  
  const finalPrice = isHotel && data.totalPrice ? data.totalPrice - commissionAmount : data.totalPrice;
  
  // Fetch USD to COP exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        setUsdRate(data.rates.COP || 4000);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
        setUsdRate(4000);
      }
    };
    
    if (language === 'en' && isTour) {
      fetchExchangeRate();
    }
  }, [language, isTour]);


  // Generate Bold hash when price is available
  useEffect(() => {
    const generateBoldHash = async () => {
      // Solo generar hash si hay un precio válido y no es hotel
      const priceToUse = finalPrice || data.totalPrice || 0;
      if (priceToUse > 0 && !isHotel && !isLoadingHash && !boldHash) {
        setIsLoadingHash(true);
        
        // Generar orderId único y seguro (formato: RES-timestamp)
        // Ejemplo seguro según la documentación: solo letras, números, - y _
        const timestamp = Date.now();
        const orderId = `RES-${timestamp}`;
        
        // Calcular amount: entero, sin decimales, mínimo 1000 COP
        // IMPORTANTE: Este mismo amount se usará para el hash Y para el botón
        const amount = Math.max(1000, Math.round(priceToUse));
        
        // Validar que amount sea válido antes de continuar
        if (amount < 1000 || !Number.isInteger(amount)) {
          console.error('❌ Amount inválido para Bold:', {
            amount,
            priceToUse,
            isInteger: Number.isInteger(amount),
            isValid: amount >= 1000
          });
          setIsLoadingHash(false);
          return;
        }
        
        setBoldOrderId(orderId);
        // Guardar el amount y orderId para usarlos exactamente igual en el botón
        // CRÍTICO: El amount debe ser exactamente el mismo que se usa para generar el hash
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('boldAmount', amount.toString());
          sessionStorage.setItem('boldOrderId', orderId);
          
          // También guardar el mapeo boldOrderId -> codigoReserva si está disponible
          // Esto nos permitirá buscar la reserva cuando llegue el webhook o cuando regrese del pago
          const lastReservationCode = sessionStorage.getItem('lastReservationCode') || localStorage.getItem('lastReservationCode');
          if (lastReservationCode) {
            sessionStorage.setItem(`boldOrderId_${orderId}`, lastReservationCode);
            localStorage.setItem(`boldOrderId_${orderId}`, lastReservationCode);
            console.log('💾 Mapeo guardado en sessionStorage y localStorage:', {
              boldOrderId: orderId,
              codigoReserva: lastReservationCode
            });
          } else {
            // Si aún no existe el codigoReserva, guardar el boldOrderId para crear el mapeo después
            // cuando se cree la reserva
            sessionStorage.setItem('pendingBoldOrderId', orderId);
            localStorage.setItem('pendingBoldOrderId', orderId);
            console.log('💾 Guardado pendingBoldOrderId para crear mapeo después:', orderId);
          }
          
          console.log('💾 Guardado en sessionStorage:', {
            boldAmount: amount.toString(),
            boldOrderId: orderId,
            amountType: typeof amount,
            amountIsInteger: Number.isInteger(amount),
            codigoReserva: lastReservationCode || 'no disponible aún'
          });
        }

        try {
          // Log detallado antes de generar el hash
          console.log('🔐 [BOLD HASH GENERATION] Enviando datos para generar hash:', {
            orderId,
            amount,
            amountType: typeof amount,
            amountIsInteger: Number.isInteger(amount),
            currency: 'COP',
            nodeEnv: typeof window !== 'undefined' ? 'client' : 'server',
            hostname: typeof window !== 'undefined' ? window.location.hostname : 'server'
          });
          
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
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ [BOLD HASH GENERATION] Error response from API:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData
            });
            throw new Error(errorData.error || 'Error generating hash');
          }
          
          const result = await response.json();
          
          if (result.hash) {
            console.log('✅ [BOLD HASH GENERATION] Hash generado exitosamente:', {
              orderId,
              amount,
              currency: 'COP',
              hashLength: result.hash.length,
              hashFormat: /^[a-f0-9]{64}$/i.test(result.hash),
              hashPreview: result.hash.substring(0, 20) + '...'
            });
            setBoldHash(result.hash);
            
            // Crear la reserva automáticamente cuando el hash esté listo (solo si no es hotel)
            // Esto asegura que la reserva exista cuando el usuario regrese del pago
            // IMPORTANTE: Solo crear UNA VEZ para evitar duplicados
            if (!isHotel && priceToUse > 0) {
              // Verificar si ya existe una reserva creada para evitar duplicados
              const existingReservation = sessionStorage.getItem('lastReservationCode') || localStorage.getItem('lastReservationCode');
              const reservationCreating = sessionStorage.getItem('reservationCreating') === 'true';
              
              if (!existingReservation && !reservationCreating) {
                console.log('🔄 Creando reserva automáticamente antes de mostrar botón de Bold...');
                // Marcar que estamos creando la reserva para evitar duplicados
                sessionStorage.setItem('reservationCreating', 'true');
                
                // Llamar a onConfirm para crear la reserva en segundo plano
                // Esto creará la reserva con estado "agendada_con_cotizacion"
                setTimeout(async () => {
                  try {
                    await onConfirm();
                    // Limpiar el flag después de crear la reserva
                    sessionStorage.removeItem('reservationCreating');
                  } catch (error) {
                    console.error('❌ Error al crear reserva:', error);
                    sessionStorage.removeItem('reservationCreating');
                  }
                }, 500); // Pequeño delay para asegurar que el hash se guarde primero
              } else {
                if (existingReservation) {
                  console.log('✅ Reserva ya existe, no se creará duplicado. Código:', existingReservation);
                }
                if (reservationCreating) {
                  console.log('⏳ Reserva ya se está creando, esperando...');
                }
              }
            }
          } else {
            console.error('No hash in response:', result);
          }
        } catch (error) {
          console.error('Error generating Bold hash:', error);
        } finally {
          setIsLoadingHash(false);
        }
      }
    };

    generateBoldHash();
  }, [finalPrice, data.totalPrice, isHotel, isLoadingHash, boldHash]);

  // Crear el botón de Bold cuando el hash esté listo
  useEffect(() => {
    const priceToUse = finalPrice || data.totalPrice || 0;
    
    console.log('🔍 [BOLD BUTTON] Verificando condiciones:', {
      boldHash: !!boldHash,
      boldHashLength: boldHash?.length,
      boldOrderId: !!boldOrderId,
      boldOrderIdValue: boldOrderId,
      boldButtonRefCurrent: !!boldButtonRef.current,
      priceToUse,
      isHotel,
      shouldCreate: !!(boldHash && boldOrderId && boldButtonRef.current && priceToUse > 0 && !isHotel)
    });
    
    if (!boldHash || !boldOrderId || !boldButtonRef.current || priceToUse <= 0 || isHotel) {
      console.log('⏸️ [BOLD BUTTON] Condiciones no cumplidas, no se creará el botón');
      return;
    }

    // Esperar a que el script de Bold esté cargado
    const checkBoldScript = () => {
      // Verificar si el script de Bold está disponible de múltiples formas
      const scriptInDOM = typeof window !== 'undefined' && 
        document.querySelector('script[src*="boldPaymentButton"]') !== null;
      const boldGlobal = typeof window !== 'undefined' && 
        (window as any).BoldPaymentButton !== undefined;
      const boldScriptLoaded = scriptInDOM || boldGlobal;
      
      console.log('🔍 [BOLD SCRIPT CHECK]', {
        scriptInDOM,
        boldGlobal,
        boldScriptLoaded,
        allScripts: typeof window !== 'undefined' ? Array.from(document.querySelectorAll('script[src]')).map(s => (s as HTMLScriptElement).src) : []
      });
      
      if (!boldScriptLoaded) {
        console.log('⏳ [BOLD BUTTON] Esperando a que el script de Bold se cargue...');
        setTimeout(checkBoldScript, 100);
        return;
      }

      console.log('✅ [BOLD BUTTON] Script de Bold cargado, creando botón...');
      createButton();
    };

    const createButton = () => {
      // Limpia cualquier intento anterior
      if (!boldButtonRef.current) return;
      boldButtonRef.current.innerHTML = '';

      // Usar la llave pública según el entorno
      // En desarrollo: usar la clave de test
      // En producción: usar la clave de producción (si está configurada) o la de test como fallback
      const isDevelopment = typeof window !== 'undefined' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      
      const expectedApiKeyTest = 'nlFAEO2PDp9Pe2m3gZo5AepFKLWjg_9jpxhajnXkmbA';
      
      // En producción, intentar usar la clave pública de producción primero
      const apiKeyProduction = typeof window !== 'undefined' 
        ? process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY 
        : undefined;
      
      // En desarrollo o si no hay clave de producción, usar la de test
      const apiKeyTest = typeof window !== 'undefined' 
        ? process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST 
        : undefined;
      
      // Determinar qué clave usar
      const apiKey = isDevelopment 
        ? (apiKeyTest || expectedApiKeyTest)
        : (apiKeyProduction || apiKeyTest || expectedApiKeyTest);
      
      const expectedApiKey = isDevelopment ? expectedApiKeyTest : (apiKeyProduction || expectedApiKeyTest);
      
      // Log detallado para debugging
      console.log('🔑 API Key Check:', {
        fromEnv: apiKey,
        fromEnvType: typeof apiKey,
        fromEnvLength: apiKey?.length || 0,
        expected: expectedApiKey,
        matches: apiKey === expectedApiKey,
        isEmpty: !apiKey,
        isUndefined: apiKey === undefined,
        isNull: apiKey === null,
        trimmed: apiKey?.trim() || '',
        allEnvKeys: Object.keys(process.env).filter(k => k.includes('BOLD'))
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

      const baseUrl = getBaseUrl();
      
      // CRÍTICO: Usar SIEMPRE el amount guardado en sessionStorage (el mismo que se usó para el hash)
      // Si no está disponible, calcular uno nuevo pero esto no debería pasar
      const savedAmount = sessionStorage.getItem('boldAmount');
      const savedOrderId = sessionStorage.getItem('boldOrderId');
      
      if (!savedAmount || !savedOrderId) {
        console.error('❌ [BOLD CONFIG] No se encontró amount u orderId en sessionStorage:', {
          savedAmount,
          savedOrderId,
          boldOrderId
        });
        return;
      }
      
      // Usar el amount exacto que se guardó (el mismo que se usó para generar el hash)
      const amount = parseInt(savedAmount, 10);
      
      // Validar que el orderId guardado coincida con el actual
      if (savedOrderId !== boldOrderId) {
        console.error('❌ [BOLD CONFIG] OrderId mismatch:', {
          saved: savedOrderId,
          current: boldOrderId
        });
        return;
      }
      
      // Validar que amount sea un entero válido
      if (!Number.isInteger(amount) || amount < 1000) {
        console.error('❌ [BOLD CONFIG] Amount inválido desde sessionStorage:', {
          amount,
          savedAmount,
          isInteger: Number.isInteger(amount),
          isValid: amount >= 1000
        });
        return;
      }

      // Validar orderId (solo letras, números, - y _, máximo 60 caracteres)
      if (!/^[a-zA-Z0-9_-]{1,60}$/.test(boldOrderId)) {
        console.error('❌ Invalid orderId format:', boldOrderId);
        return;
      }

      // Validar amount (sin decimales, mínimo 1000)
      const amountStr = amount.toString();
      if (amount < 1000) {
        console.error('❌ Amount must be at least 1000 COP. Current:', amount);
        return;
      }

      // Validar hash (debe ser 64 caracteres hex)
      if (boldHash.length !== 64 || !/^[a-f0-9]{64}$/i.test(boldHash)) {
        console.error('❌ Invalid hash format:', {
          length: boldHash.length,
          valid: /^[a-f0-9]{64}$/i.test(boldHash),
          hash: boldHash.substring(0, 20) + '...'
        });
        return;
      }

      // Determinar redirectionUrl
      // IMPORTANTE: Bold NO acepta http://localhost en data-redirection-url
      // Para desarrollo local, NO configurar data-redirection-url (Bold redirige a la página actual)
      // El interceptor en page.tsx capturará los parámetros y redirigirá a /pagos/resultado
      let redirectionUrl: string | null = null;
      
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

      // LOG CRÍTICO: [BOLD CONFIG] - Exactamente lo que se va a pasar a Bold
      console.log('🔐 [BOLD CONFIG] Configuración completa del botón:', {
        apiKey: apiKey || 'UNDEFINED',
        apiKeyLength: apiKey?.length || 0,
        apiKeyMatches: apiKey === expectedApiKey,
        apiKeySource: isDevelopment ? 'test' : (apiKeyProduction ? 'production' : 'test (fallback)'),
        orderId: boldOrderId,
        orderIdLength: boldOrderId.length,
        orderIdValid: /^[a-zA-Z0-9_-]{1,60}$/.test(boldOrderId),
        amount: amountStr,
        amountNumber: parseInt(amountStr),
        amountIsInteger: Number.isInteger(parseInt(amountStr)),
        amountIsValid: parseInt(amountStr) >= 1000,
        currency: 'COP',
        integritySignature: boldHash,
        integritySignatureLength: boldHash.length,
        integritySignatureValid: boldHash.length === 64 && /^[a-f0-9]{64}$/i.test(boldHash),
        integritySignaturePreview: boldHash.substring(0, 20) + '...',
        redirectionUrl: redirectionUrl || '(no configurada - localhost)',
        baseUrl,
        isLocalhost: baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'),
        environment: isDevelopment ? 'development' : 'production',
        // Verificar que los datos coincidan con los usados para generar el hash
        savedAmount: sessionStorage.getItem('boldAmount'),
        savedOrderId: sessionStorage.getItem('boldOrderId'),
        dataMatches: savedAmount === amountStr && savedOrderId === boldOrderId
      });

      // Validaciones críticas antes de crear el botón
      if (!apiKey || apiKey.trim() === '') {
        console.error('❌ [BOLD CONFIG] apiKey está vacío o undefined');
        return;
      }
      if (parseInt(amountStr) < 1000) {
        console.error('❌ [BOLD CONFIG] amount es menor a 1000:', amountStr);
        return;
      }
      if (!Number.isInteger(parseInt(amountStr))) {
        console.error('❌ [BOLD CONFIG] amount no es un entero:', amountStr);
        return;
      }
      if (boldHash.length !== 64) {
        console.error('❌ [BOLD CONFIG] integritySignature no tiene 64 caracteres:', boldHash.length);
        return;
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
      script.setAttribute('data-order-id', boldOrderId);
      script.setAttribute('data-amount', amountStr); // Sin decimales
      script.setAttribute('data-currency', 'COP');
      script.setAttribute('data-integrity-signature', boldHash);
      
      // Atributos opcionales
      script.setAttribute('data-description', `Pago de reserva: ${serviceName}`);
      script.setAttribute('data-extra-data-1', boldOrderId);
      
      // Configurar redirection-url siempre (tanto para localhost como producción)
      // Para localhost usamos http:// aunque Bold prefiera https://
      if (redirectionUrl) {
        script.setAttribute('data-redirection-url', redirectionUrl);
        console.log('✅ Redirection URL configurada:', redirectionUrl);
      } else {
        console.warn('⚠️ No se pudo configurar redirection URL');
      }

      // Datos del cliente
      if (data.email || data.name || data.whatsapp) {
        const customerData: any = {};
        if (data.email) customerData.email = data.email;
        if (data.name) customerData.fullName = data.name;
        if (data.whatsapp) {
          customerData.phone = data.whatsapp.replace(/\D/g, '');
          customerData.dialCode = '+57';
        }
        if (Object.keys(customerData).length > 0) {
          script.setAttribute('data-customer-data', JSON.stringify(customerData));
        }
      }

      // Verificar que todos los atributos se hayan establecido correctamente
      const apiKeyAttr = script.getAttribute('data-api-key');
      console.log('📋 Script attributes before append:', {
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
        'data-extra-data-1': script.getAttribute('data-extra-data-1'),
        'data-customer-data': script.getAttribute('data-customer-data') ? 'presente' : 'no presente',
        'src': script.src
      });
      
      // Verificar que todos los atributos obligatorios estén presentes (según doc: amount requiere currency, order-id, integrity-signature)
      const requiredAttrs = ['data-bold-button', 'data-api-key', 'data-order-id', 'data-amount', 'data-currency', 'data-integrity-signature'];
      const missingAttrs = requiredAttrs.filter(attr => !script.hasAttribute(attr));
      if (missingAttrs.length > 0) {
        console.error('❌ FALTAN ATRIBUTOS OBLIGATORIOS:', missingAttrs);
      } else {
        console.log('✅ Todos los atributos obligatorios están presentes');
      }

      boldButtonRef.current.appendChild(script);

      console.log('✅ Script de botón Bold creado y agregado al DOM');
      
      // Agregar listener para capturar cuando se hace clic en el botón
      setTimeout(() => {
        const buttonElement = boldButtonRef.current?.querySelector('button, [class*="bold"], iframe, a');
        if (buttonElement) {
          console.log('🎯 Botón encontrado, agregando listener de clic...');
          buttonElement.addEventListener('click', (e) => {
            console.log('🖱️ CLICK EN BOTÓN BOLD - Atributos en el momento del clic:');
            const scriptElement = boldButtonRef.current?.querySelector('script[data-bold-button]');
            if (scriptElement) {
              const allAttrs: Record<string, string> = {};
              Array.from(scriptElement.attributes).forEach(attr => {
                allAttrs[attr.name] = attr.value;
              });
              console.log('📋 Script attributes en el momento del clic:', {
                ...allAttrs,
                'data-api-key-full': allAttrs['data-api-key'], // Mostrar completa
                'data-integrity-signature-full': allAttrs['data-integrity-signature']?.substring(0, 20) + '...'
              });
            }
            const buttonAttrs: Record<string, string> = {};
            Array.from(buttonElement.attributes).forEach(attr => {
              buttonAttrs[attr.name] = attr.value;
            });
            console.log('📋 Button element attributes:', buttonAttrs);
          }, { once: true });
        }
      }, 1000);
      
      // Verificar después de 2 segundos que el script se haya procesado
      setTimeout(() => {
        const scriptElement = boldButtonRef.current?.querySelector('script[data-bold-button]');
        const buttonElement = boldButtonRef.current?.querySelector('button, [class*="bold"], iframe');
        console.log('🔍 Button check after 2s:', {
          scriptFound: !!scriptElement,
          buttonFound: !!buttonElement,
          buttonType: buttonElement?.tagName,
          scriptAttributes: scriptElement ? Array.from(scriptElement.attributes).map(a => {
            if (a.name === 'data-api-key') {
              return `${a.name}="${a.value}"`; // Mostrar completa la API key
            }
            return `${a.name}="${a.value.substring(0, 30)}..."`;
          }) : [],
          containerHTML: boldButtonRef.current?.innerHTML.substring(0, 200)
        });
      }, 2000);
    };

    checkBoldScript();

    return () => {
      // Limpieza al desmontar / regenerar
      if (boldButtonRef.current) {
        boldButtonRef.current.innerHTML = '';
      }
    };
  }, [boldHash, boldOrderId, finalPrice, data.totalPrice, isHotel, data.email, data.name, data.whatsapp, serviceName]);
  
  // Format price in COP
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Convert COP to USD
  const convertToUSD = (cop: number): string => {
    if (!usdRate) return '';
    const usd = cop / usdRate;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(usd);
  };
  
  // Boat ride prices - now from database
  const getBoatRidePrice = (boatRide: string): number => {
    return getPrecioAdicional('bote', boatRide);
  };
  
  // Use dynamic pricing from database
  const getLunchPricePerPerson = (): number => {
    return getPrecioAdicional('almuerzo');
  };
  
  const getGuidePrice = (tourLanguage: string): number => {
    return getPrecioAdicional(tourLanguage === 'spanish' ? 'guia_espanol' : 'guia_ingles');
  };

  const getVehicleImage = () => {
    // Use selected vehicle if available, otherwise use vehicleImage from data, or find based on passengers
    const minPassengers = (serviceId === 'city-tour' || serviceId === 'graffiti-tour' || serviceId === 'hacienda-napoles-tour' || serviceId === 'atv-tour' || serviceId === 'coffee-farm-tour' || serviceId === 'parapente-tour' || serviceId === 'jardin-tour' || serviceId === 'occidente-tour' || serviceId === 'airport-transfer') ? 1 : 4;
    if (!data.passengers || data.passengers < minPassengers) {
      return null;
    }
    const ranges = getVehicleRanges();
    if (data.selectedVehicle) {
      return data.selectedVehicle;
    }
    if (data.vehicleImage) {
      return data.vehicleImage;
    }
    const vehicle = ranges.find(range => data.passengers >= range.min && data.passengers <= range.max);
    return vehicle?.image || null;
  };

  const getVehicleLabel = () => {
    const image = getVehicleImage();
    if (!image) return '';
    const ranges = getVehicleRanges();
    const vehicle = ranges.find(v => v.image === image);
    return vehicle?.label || '';
  };
  
  const getVehiclePrice = (): number => {
    const image = getVehicleImage();
    if (!image) return 0;
    const ranges = getVehicleRanges();
    const vehicle = ranges.find(v => v.image === image);
    return vehicle?.price || 0;
  };

  const formatTime = () => {
    return `${data.time} ${data.timePeriod}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <h3 className="text-2xl font-semibold mb-6">
        Resumen de Reserva
      </h3>

      {/* Invoice-style summary */}
      <div className="bg-gray-50 rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Service */}
        <div className="pb-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">{t('service')}</p>
          <div className="flex items-center gap-3">
            <div className="relative w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
              {serviceImage.startsWith('/') ? (
                <Image 
                  src={serviceImage} 
                  alt={serviceName}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <span className="text-2xl">{serviceImage}</span>
              )}
            </div>
            <p className="text-xl font-bold">{serviceName}</p>
          </div>
        </div>

        {/* Trip details */}
        <div className="space-y-4">
          {isCustomTransport ? (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                {t('hoursNeeded')}
              </p>
              <p className="font-semibold text-lg">{data.hoursNeeded} {t('hours')}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                  <MapPin className="w-3 h-3" />
                  {t('origin')}
                </p>
                <p className="font-semibold text-lg">{data.from}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                  <MapPin className="w-3 h-3" />
                  {t('destination')}
                </p>
                <p className="font-semibold text-lg">{data.to}</p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Calendar className="w-3 h-3" />
                {t('date')}
              </p>
              <p className="font-semibold">{data.date}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                {t('time')}
              </p>
              <p className="font-semibold">{formatTime()}</p>
            </div>
          </div>

          {/* Flight Number */}
          {data.flightNumber && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-wide">
                <Plane className="w-3 h-3" />
                {t('flightNumber')}
              </p>
              <p className="font-semibold">{data.flightNumber}</p>
            </div>
          )}

          {/* Passengers and Vehicle */}
          {(() => {
            const minPassengers = (serviceId === 'city-tour' || serviceId === 'graffiti-tour' || serviceId === 'hacienda-napoles-tour' || serviceId === 'atv-tour' || serviceId === 'coffee-farm-tour' || serviceId === 'parapente-tour' || serviceId === 'jardin-tour' || serviceId === 'occidente-tour' || serviceId === 'airport-transfer') ? 1 : 4;
            return data.passengers >= minPassengers && getVehicleImage();
          })() && (
            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-1 uppercase tracking-wide">
                <Users className="w-3 h-3" />
                {t('passengers')} y Vehículo
              </p>
              <div className="flex items-center gap-6">
                <div className="relative w-48 h-36 sm:w-56 sm:h-40 md:w-64 md:h-48 flex-shrink-0">
                  <Image
                    src={getVehicleImage()!}
                    alt={getVehicleLabel()}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      (e.target as HTMLImageElement).src = '/auto-removebg-preview.png';
                    }}
                  />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {data.passengers} {data.passengers === 1 ? 'pasajero' : 'pasajeros'}
                  </p>
                  <p className="text-sm text-gray-600">{getVehicleLabel()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contact details */}
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Contacto</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" />
                {t('name')}
              </p>
              <p className="font-medium">{data.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {t('whatsapp')}
              </p>
              <p className="font-medium">{data.whatsapp}</p>
            </div>
            {data.email && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {t('email')}
                </p>
                <p className="font-medium">{data.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Attending Persons - For all tours */}
        {data.attendingPersons && data.attendingPersons.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              {t('attendingPersonsTitle')}
            </p>
            <div className="space-y-3">
              {data.attendingPersons.map((person, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {t('personNumber')} {index + 1}: {person.name}
                  </p>
                  <p className="text-xs text-gray-600">
                    {person.identificationType === 'cedula' ? t('cedula') : t('passport')}: {person.identificationNumber}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tour Language - For all tours */}
        {serviceId.includes('-tour') && data.tourLanguage && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">{t('tourLanguage')}:</span>
              <span className="font-medium">{data.tourLanguage === 'spanish' ? t('tourLanguageSpanish') : t('tourLanguageEnglish')}</span>
            </div>
          </div>
        )}

        {/* Tour Additional Services */}
        {serviceId.includes('-tour') && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">{t('additionalServices')}</p>
            <div className="space-y-2">
              {/* Certified Guide */}
              {data.wantsGuide && data.tourLanguage && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {data.tourLanguage === 'spanish' ? 'Guía en Español' : 'Guía en Inglés'}:
                  </span>
                  <span className="font-medium">
                    {formatPrice(getGuidePrice(data.tourLanguage))} COP
                  </span>
                </div>
              )}
              {/* Guatapé Tour specific services */}
              {serviceId === 'guatape-tour' && (
                <>
                  {data.boatRide && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{t('boatRide')}:</span>
                      <span className="font-medium">{data.boatRide === '1-6' ? t('boatRide16') : data.boatRide === '1-15' ? t('boatRide115') : data.boatRide === '1-22' ? t('boatRide122') : t('boatRide130')}</span>
                    </div>
                  )}
                  {data.lunchCount && parseInt(data.lunchCount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{t('lunchCount')}:</span>
                      <span className="font-medium">{data.lunchCount} ({t('lunchPrice')})</span>
                    </div>
                  )}
                </>
              )}
              {/* ATV Tour specific services */}
              {serviceId === 'atv-tour' && data.atvCount && parseInt(data.atvCount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Motos ATV:</span>
                  <span className="font-medium">
                    {data.atvCount} moto{parseInt(data.atvCount) > 1 ? 's' : ''} ({formatPrice(300000 * parseInt(data.atvCount))} COP)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes and recommendations */}
        {(data.additionalNotes || data.recommendations.length > 0) && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">Información adicional</p>
            {data.additionalNotes && (
              <p className="text-sm text-gray-700 mb-2">{data.additionalNotes}</p>
            )}
            {data.recommendations.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {data.recommendations.map((rec) => (
                  <span key={rec} className="px-3 py-1 bg-white rounded-full text-xs font-medium border border-gray-200">
                    {rec}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quote - For all services */}
        {/* Si municipio es "otro" y hay municipioOtro escrito, mostrar pendiente de cotización */}
        {/* Esto aplica para TODOS los servicios que tengan campo de municipio */}
        {data.municipio === 'otro' && data.municipioOtro && data.municipioOtro.trim() !== '' ? (
          <div className="pt-4 border-t-2 border-gray-300">
            {/* Municipio Otro - Cotización pendiente - Para todos los servicios */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
              <div className="flex items-start gap-2">
                <span className="text-blue-800 text-sm">
                  📍 Municipio: <strong>{data.municipioOtro}</strong>
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-1">
                💬 Te daremos la cotización por correo en minutos una vez envíes los datos
              </p>
            </div>
            
            {/* Mensaje de cotización pendiente */}
            <div className="flex items-center justify-between pt-3">
              <span className="text-lg font-bold text-gray-900">
                Cotización total:
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-600">
                  PENDIENTE POR COTIZACIÓN
                </span>
              </div>
            </div>
          </div>
        ) : (isTour || serviceId === 'airport-transfer') && data.totalPrice && data.totalPrice > 0 ? (
          <div className="pt-4 border-t-2 border-gray-300">
            
            {/* Total before commission (only show if hotel mode) */}
            {isHotel && data.totalPrice > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 mb-2">
                <span className="text-lg font-semibold text-gray-900">{t('totalQuote')}:</span>
                <div className="text-right">
                  <span className="text-xl font-semibold text-gray-700">
                    {formatPrice(data.totalPrice)} COP
                  </span>
                </div>
              </div>
            )}
            
            {/* Hotel Commission */}
            {isHotel && commissionAmount > 0 && (
              <div className="flex items-center justify-between text-sm pt-2 mb-2">
                <span className="text-gray-700">
                  {t('hotelCommission')}:
                </span>
                <span className="font-medium text-red-600">
                  -{formatPrice(commissionAmount)} COP
                </span>
              </div>
            )}
            
            {/* Final Total - Solo mostrar si hay precio */}
            {(finalPrice || data.totalPrice) > 0 && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-lg font-bold text-gray-900">
                  {isHotel ? t('finalPrice') : 'Cotización total'}:
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-black">
                    {formatPrice(finalPrice || data.totalPrice)} COP
                  </span>
                  {language === 'en' && usdRate && (
                    <p className="text-sm text-gray-600 mt-1">
                      ({convertToUSD(finalPrice || data.totalPrice)} {t('usd')})
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Mensaje de cotización pendiente - Solo si NO es municipio "otro" con municipioOtro */}
            {(finalPrice || data.totalPrice) === 0 && !(data.municipio === 'otro' && data.municipioOtro && data.municipioOtro.trim() !== '') && (
              <div className="pt-2 text-center">
                <span className="text-xl font-semibold text-gray-600">
                  {t('quotePending')}
                </span>
              </div>
            )}
          </div>
        ) : (isTour || serviceId === 'airport-transfer' || serviceId === 'custom-transport') && data.totalPrice && data.totalPrice > 0 ? (
          <div className="pt-4 border-t-2 border-gray-300">
            {/* Total before commission (only show if hotel mode) */}
            {isHotel && data.totalPrice > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 mb-2">
                <span className="text-lg font-semibold text-gray-900">{t('totalQuote')}:</span>
                <div className="text-right">
                  <span className="text-xl font-semibold text-gray-700">
                    {formatPrice(data.totalPrice)} COP
                  </span>
                </div>
              </div>
            )}
            
            {/* Hotel Commission */}
            {isHotel && commissionAmount > 0 && (
              <div className="flex items-center justify-between text-sm pt-2 mb-2">
                <span className="text-gray-700">
                  {t('hotelCommission')}:
                </span>
                <span className="font-medium text-red-600">
                  -{formatPrice(commissionAmount)} COP
                </span>
              </div>
            )}
            
            {/* Final Total - Solo mostrar si hay precio */}
            {(finalPrice || data.totalPrice) > 0 && (
              <div className="flex items-center justify-between pt-3">
                <span className="text-lg font-bold text-gray-900">
                  {isHotel ? t('finalPrice') : 'Cotización total'}:
                </span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-black">
                    {formatPrice(finalPrice || data.totalPrice)} COP
                  </span>
                  {language === 'en' && usdRate && (
                    <p className="text-sm text-gray-600 mt-1">
                      ({convertToUSD(finalPrice || data.totalPrice)} {t('usd')})
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (isTour || serviceId === 'airport-transfer' || serviceId === 'custom-transport') ? (
          <div className="pt-4 border-t-2 border-gray-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">{t('quote')}</p>
                <p className="text-2xl font-bold text-black">
                  {t('quotePending')}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Si el destino no está en lista, la cotización será confirmada por un asesor.
            </p>
          </div>
        ) : null}
      </div>

      {/* Cancellation policy */}
      <p className="text-xs text-gray-500 text-center">
        {t('cancellationPolicy')}
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 text-black hover:bg-gray-100 rounded-2xl font-medium transition-colors min-h-[44px] border-2 border-gray-200"
        >
          Volver a editar información
        </button>
        
        {/* Contenedor para el botón - siempre visible */}
        <div className="flex-1 flex justify-center">
          {/* Botón normal por defecto - se reemplazará por Bold cuando esté listo */}
          {/* IMPORTANTE: Solo mostrar botón "Confirmar" si NO hay reserva creada ya */}
          {(() => {
            const priceToUse = finalPrice || data.totalPrice || 0;
            const hasPrice = priceToUse > 0;
            const shouldShowNormalButton = !boldHash || !boldOrderId || isHotel || !hasPrice;
            
            console.log('🎯 [BOLD BUTTON RENDER]', {
              boldHash: !!boldHash,
              boldHashLength: boldHash?.length,
              boldOrderId: !!boldOrderId,
              boldOrderIdValue: boldOrderId,
              isHotel,
              hasPrice,
              priceToUse,
              shouldShowNormalButton,
              isSubmitting,
              willShowBold: !shouldShowNormalButton,
              boldButtonRefExists: !!boldButtonRef.current
            });
            
            if (shouldShowNormalButton) {
              return (
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('🖱️ Click en botón de confirmar', {
                      isHotel,
                      isSubmitting,
                      hasPrice: (finalPrice || data.totalPrice || 0) > 0
                    });
                    
                    // Si el botón está deshabilitado, no hacer nada
                    if (isSubmitting) {
                      console.warn('⚠️ El botón está deshabilitado (isSubmitting = true)');
                      return;
                    }
                    
                    // Verificar si ya existe una reserva antes de crear otra
                    const existingReservation = sessionStorage.getItem('lastReservationCode') || localStorage.getItem('lastReservationCode');
                    const reservationCreating = sessionStorage.getItem('reservationCreating') === 'true';
                    
                    if (existingReservation) {
                      console.warn('⚠️ Ya existe una reserva creada:', existingReservation);
                      
                      // Si es hotel y ya existe una reserva, redirigir a la página de tracking
                      if (isHotel) {
                        console.log('🏨 Es hotel, redirigiendo a página de tracking...');
                        window.location.href = `/tracking/${existingReservation}`;
                        return;
                      }
                      
                      // Para usuarios normales, no crear duplicado
                      console.warn('📝 Código de reserva existente:', existingReservation);
                      return;
                    }
                    
                    if (reservationCreating) {
                      console.warn('⚠️ La reserva ya se está creando. Por favor espera...');
                      return;
                    }
                    
                    // Verificar si hay precio para determinar el flujo
                    const priceToUse = finalPrice || data.totalPrice || 0;
                    const hasPrice = priceToUse > 0;
                    
                    console.log('🔄 Iniciando creación de reserva...');
                    console.log('💰 Precio disponible:', hasPrice ? `$${priceToUse}` : 'Sin precio (cotización pendiente)');
                    console.log('🏨 Es hotel:', isHotel);
                    
                    // Solo crear si no existe y no se está creando
                    try {
                      await onConfirm();
                      console.log('✅ Reserva creada exitosamente');
                    } catch (error) {
                      console.error('❌ Error al crear reserva:', error);
                      alert('Error al crear la reserva. Por favor, intenta nuevamente.');
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-black text-white rounded-2xl font-medium hover:bg-gray-800 transition-colors min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : (
                    (() => {
                      const priceToUse = finalPrice || data.totalPrice || 0;
                      const hasPrice = priceToUse > 0;
                      
                      if (isHotel) {
                        return t('confirmAndSchedule');
                      } else if (!hasPrice) {
                        return 'Solicitar cotización y confirmación en minutos';
                      } else {
                        return t('payService');
                      }
                    })()
                  )}
                </button>
              );
            } else {
              // Mostrar contenedor para botón de Bold cuando hay precio
              console.log('✅ [BOLD BUTTON RENDER] Renderizando div para botón de Bold');
              return (
                <div 
                  className="w-full min-h-[60px] flex items-center justify-center" 
                  ref={boldButtonRef}
                  style={{ minHeight: '60px' }}
                >
                  {/* El botón se creará dinámicamente aquí */}
                </div>
              );
            }
          })()}
        </div>
      </div>
    </motion.div>
  );
}

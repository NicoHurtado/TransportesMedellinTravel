'use client';

import { useEffect, useRef, useState } from 'react';

export default function TestBoldPage() {
  const [boldHash, setBoldHash] = useState<string | null>(null);
  const [boldOrderId, setBoldOrderId] = useState<string | null>(null);
  const [isLoadingHash, setIsLoadingHash] = useState(false);
  const boldButtonRef = useRef<HTMLDivElement>(null);

  // Monto de prueba
  const testAmount = 400001; // 400.001 COP

  // Generar hash cuando se carga la página
  useEffect(() => {
    const generateHash = async () => {
      setIsLoadingHash(true);
      
      // Generar orderId único
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const orderId = `TEST-${timestamp}-${randomId}`;
      setBoldOrderId(orderId);

      // Guardar amount
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('boldAmount', testAmount.toString());
        sessionStorage.setItem('boldOrderId', orderId);
      }

      try {
        const response = await fetch('/api/bold/generate-hash', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orderId,
            amount: testAmount,
            currency: 'COP',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Error response from API:', errorData);
          throw new Error(errorData.error || 'Error generating hash');
        }

        const result = await response.json();

        if (result.hash) {
          console.log('✅ Bold hash generated successfully:', {
            orderId,
            amount: testAmount,
            currency: 'COP',
            hash: result.hash.substring(0, 20) + '...'
          });
          setBoldHash(result.hash);
        } else {
          console.error('❌ No hash in response:', result);
        }
      } catch (error) {
        console.error('❌ Error generating Bold hash:', error);
      } finally {
        setIsLoadingHash(false);
      }
    };

    generateHash();
  }, []);

  // Capturar mensajes de Bold en la consola
  useEffect(() => {
    // Interceptar console.error para capturar mensajes de Bold
    const originalError = console.error;
    console.error = function(...args: any[]) {
      const message = args[0]?.toString() || '';
      if (message.includes('Bold') || message.includes('BTN-')) {
        console.warn('🚨 BOLD ERROR DETECTED:', ...args);
      }
      originalError.apply(console, args);
    };

    // Interceptar console.warn también
    const originalWarn = console.warn;
    console.warn = function(...args: any[]) {
      const message = args[0]?.toString() || '';
      if (message.includes('Bold') || message.includes('BTN-')) {
        console.warn('⚠️ BOLD WARNING:', ...args);
      }
      originalWarn.apply(console, args);
    };

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Crear el botón de Bold cuando el hash esté listo
  useEffect(() => {
    if (!boldHash || !boldOrderId || !boldButtonRef.current) return;

    // Esperar a que el script de Bold esté cargado
    const checkBoldScript = () => {
      // Verificar si el script de Bold está disponible
      const boldScriptLoaded = typeof window !== 'undefined' && 
        (document.querySelector('script[src*="boldPaymentButton"]') !== null ||
         (window as any).BoldPaymentButton !== undefined);
      
      if (!boldScriptLoaded) {
        console.log('⏳ Esperando a que el script de Bold se cargue...');
        setTimeout(checkBoldScript, 100);
        return;
      }

      console.log('✅ Script de Bold cargado, creando botón...');
      createButton();
    };

    const createButton = () => {
      // Limpia cualquier intento anterior
      if (!boldButtonRef.current) return;
      boldButtonRef.current.innerHTML = '';

    // Usar la llave de identidad de prueba del tab "Botón de pagos"
    // IMPORTANTE: Esta debe ser la llave del tab "Botón de pagos", NO la de "API Integrations"
    const apiKey = process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST || '';
    const expectedApiKey = 'nlFAEO2PDp9Pe2m3gZo5AepFKLWjg_9jpxhajnXkmbA';
    
    console.log('🔑 API Key Check:', {
      fromEnv: apiKey,
      expected: expectedApiKey,
      matches: apiKey === expectedApiKey,
      length: apiKey.length,
      expectedLength: expectedApiKey.length,
      isEmpty: !apiKey
    });
    
    if (!apiKey) {
      console.error('❌ NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST no está configurada');
      console.error('❌ Verifica que la variable esté en .env y que el servidor se haya reiniciado');
      return;
    }
    
    if (apiKey !== expectedApiKey) {
      console.warn('⚠️ API Key no coincide con la esperada:', {
        actual: apiKey,
        expected: expectedApiKey
      });
    }
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

    // Validar orderId (solo letras, números, - y _, máximo 60 caracteres)
    if (!/^[a-zA-Z0-9_-]{1,60}$/.test(boldOrderId)) {
      console.error('❌ Invalid orderId format:', boldOrderId);
      return;
    }

    // Validar amount (sin decimales, mínimo 1000)
    const amountStr = testAmount.toString();
    if (testAmount < 1000) {
      console.error('❌ Amount must be at least 1000 COP');
      return;
    }

    // Validar hash (debe ser 64 caracteres hex)
    if (boldHash.length !== 64 || !/^[a-f0-9]{64}$/i.test(boldHash)) {
      console.error('❌ Invalid hash format:', {
        length: boldHash.length,
        valid: /^[a-f0-9]{64}$/i.test(boldHash)
      });
      return;
    }

    console.log('🔘 Creating Bold button with config:', {
      apiKey: apiKey.substring(0, 20) + '...',
      apiKeyFull: apiKey, // Mostrar completa para verificar
      apiKeyLength: apiKey.length,
      apiKeyExpected: 'nlFAEO2PDp9Pe2m3gZo5AepFKLWjg_9jpxhajnXkmbA',
      apiKeyMatches: apiKey === 'nlFAEO2PDp9Pe2m3gZo5AepFKLWjg_9jpxhajnXkmbA',
      orderId: boldOrderId,
      orderIdLength: boldOrderId.length,
      orderIdValid: /^[a-zA-Z0-9_-]{1,60}$/.test(boldOrderId),
      amount: amountStr,
      amountNumber: parseInt(amountStr),
      currency: 'COP',
      hashLength: boldHash.length,
      hashValid: boldHash.length === 64 && /^[a-f0-9]{64}$/i.test(boldHash),
      hashFirstChars: boldHash.substring(0, 10),
      baseUrl,
      isLocalhost: baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1'),
      redirectionUrlConfigured: !baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')
    });

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
    script.setAttribute('data-api-key', apiKey);
    script.setAttribute('data-order-id', boldOrderId);
    script.setAttribute('data-amount', amountStr); // Sin decimales
    script.setAttribute('data-currency', 'COP');
    script.setAttribute('data-integrity-signature', boldHash);
    
    // Atributos opcionales
    script.setAttribute('data-description', 'Prueba de pago Bold');
    
    // SOLO poner redirection-url si NO estamos en localhost (Bold requiere https://)
    // Si no lo ponemos, Bold usará la misma URL donde está el botón como retorno
    if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
      // En producción debe ser https://
      const redirectionUrl = baseUrl.startsWith('https://') 
        ? `${baseUrl}/pagos/resultado`
        : `https://${baseUrl.replace(/^https?:\/\//, '')}/pagos/resultado`;
      script.setAttribute('data-redirection-url', redirectionUrl);
      console.log('✅ Redirection URL configurada (producción):', redirectionUrl);
    } else {
      console.log('ℹ️ Redirection URL omitida (desarrollo local - Bold requiere https://)');
    }

    // Verificar que todos los atributos se hayan establecido correctamente
    const apiKeyAttr = script.getAttribute('data-api-key');
    console.log('📋 Script attributes before append:', {
      'data-bold-button': script.getAttribute('data-bold-button'),
      'data-api-key': apiKeyAttr?.substring(0, 20) + '...',
      'data-api-key-full': apiKeyAttr, // MOSTRAR COMPLETA PARA DEBUGGING
      'data-api-key-length': apiKeyAttr?.length,
      'data-api-key-expected': 'nlFAEO2PDp9Pe2m3gZo5AepFKLWjg_9jpxhajnXkmbA',
      'data-api-key-matches': apiKeyAttr === 'nlFAEO2PDp9Pe2m3gZo5AepFKLWjg_9jpxhajnXkmbA',
      'data-order-id': script.getAttribute('data-order-id'),
      'data-amount': script.getAttribute('data-amount'),
      'data-currency': script.getAttribute('data-currency'),
      'data-integrity-signature': script.getAttribute('data-integrity-signature')?.substring(0, 10) + '...',
      'data-description': script.getAttribute('data-description'),
      'data-redirection-url': script.getAttribute('data-redirection-url') || '(no configurada - usando URL por defecto)',
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
      
      // Forzar a Bold a re-escaneear el DOM después de agregar el script
      // Esperar un momento para que el script se procese
      setTimeout(() => {
        // Intentar disparar un evento personalizado que Bold pueda escuchar
        const event = new Event('DOMContentLoaded', { bubbles: true });
        document.dispatchEvent(event);
        
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
      }, 100);
    };

    checkBoldScript();

    return () => {
      // Limpieza al desmontar / regenerar
      if (boldButtonRef.current) {
        boldButtonRef.current.innerHTML = '';
      }
    };
  }, [boldHash, boldOrderId]);

  // Prueba simple sin amount para validar API key
  useEffect(() => {
    const simpleTestRef = document.getElementById('bold-button-simple-test');
    if (!simpleTestRef) return;

    // Esperar a que el script de Bold esté cargado
    const checkAndCreateSimple = () => {
      const boldScriptLoaded = typeof window !== 'undefined' && 
        (document.querySelector('script[src*="boldPaymentButton"]') !== null ||
         (window as any).BoldPaymentButton !== undefined);
      
      if (!boldScriptLoaded) {
        setTimeout(checkAndCreateSimple, 100);
        return;
      }

      // Usar la llave de identidad de prueba del tab "Botón de pagos"
      const apiKey = process.env.NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST || '';
      if (!apiKey) {
        console.error('❌ NEXT_PUBLIC_BOLD_PUBLIC_KEY_TEST no está configurada');
        return;
      }
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

      console.log('🔘 Creating simple button (no amount):', {
        apiKey: apiKey.substring(0, 20) + '...',
        apiKeyFull: apiKey, // Mostrar completa para verificar
        baseUrl,
        isLocalhost: baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
      });

      // Script CON src: según la doc de Bold, cuando agregas scripts dinámicamente,
      // debes incluir src en el mismo script tag para que Bold lo procese
      const simpleScript = document.createElement('script');
      simpleScript.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      simpleScript.async = true;
      simpleScript.setAttribute('data-bold-button', 'dark-L');
      simpleScript.setAttribute('data-api-key', apiKey);
      simpleScript.setAttribute('data-description', 'Prueba sin monto definido');
      
      // SOLO poner redirection-url si NO estamos en localhost (Bold requiere https://)
      if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
        const simpleRedirectionUrl = baseUrl.startsWith('https://') 
          ? `${baseUrl}/pagos/resultado`
          : `https://${baseUrl.replace(/^https?:\/\//, '')}/pagos/resultado`;
        simpleScript.setAttribute('data-redirection-url', simpleRedirectionUrl);
        console.log('✅ Simple button - Redirection URL configurada (producción):', simpleRedirectionUrl);
      } else {
        console.log('ℹ️ Simple button - Redirection URL omitida (desarrollo local)');
      }
      
      // Verificar atributos antes de agregar
      console.log('📋 Simple script attributes:', {
        'data-bold-button': simpleScript.getAttribute('data-bold-button'),
        'data-api-key': simpleScript.getAttribute('data-api-key')?.substring(0, 20) + '...',
        'data-description': simpleScript.getAttribute('data-description'),
        'data-redirection-url': simpleScript.getAttribute('data-redirection-url')
      });

      simpleTestRef.innerHTML = '';
      simpleTestRef.appendChild(simpleScript);

      // Forzar re-escaneo después de agregar
      setTimeout(() => {
        const event = new Event('DOMContentLoaded', { bubbles: true });
        document.dispatchEvent(event);
      }, 100);
    };

    checkAndCreateSimple();

    return () => {
      if (simpleTestRef) {
        simpleTestRef.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Prueba de Botón Bold</h1>
        
        {/* Estado del hash */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Estado del Hash:</h2>
          {isLoadingHash ? (
            <p className="text-yellow-600">⏳ Generando hash...</p>
          ) : boldHash ? (
            <div>
              <p className="text-green-600 mb-2">✅ Hash generado</p>
              <p className="text-xs text-gray-600 font-mono break-all">
                Order ID: {boldOrderId}
              </p>
              <p className="text-xs text-gray-600 font-mono break-all">
                Hash: {boldHash.substring(0, 40)}...
              </p>
            </div>
          ) : (
            <p className="text-red-600">❌ Error generando hash</p>
          )}
        </div>

        {/* Información de la transacción */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="font-semibold mb-2">Información de Prueba:</h2>
          <p><strong>Monto:</strong> {testAmount.toLocaleString('es-CO')} COP</p>
          <p><strong>Moneda:</strong> COP</p>
          <p><strong>Order ID:</strong> {boldOrderId || 'Generando...'}</p>
        </div>

        {/* Contenedor del botón */}
        <div className="mb-4">
          <h2 className="font-semibold mb-4 text-center">Botón de Pago Bold:</h2>
          <div ref={boldButtonRef} className="flex justify-center min-h-[60px] items-center border-2 border-dashed border-gray-300 rounded-lg p-4">
            {(!boldHash || !boldOrderId) && (
              <div className="text-gray-500 text-center">
                {isLoadingHash ? '⏳ Generando hash...' : '⏳ Esperando datos...'}
              </div>
            )}
          </div>
        </div>

        {/* Prueba simple sin amount para validar API key */}
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold mb-2">Prueba Simple (sin amount):</h3>
          <p className="text-xs text-gray-600 mb-2">
            Si el botón de arriba no funciona, prueba este botón simple sin monto definido para validar que la API key es correcta:
          </p>
          <div id="bold-button-simple-test" className="flex justify-center"></div>
        </div>

        {/* Instrucciones */}
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h3 className="font-semibold mb-2">Instrucciones:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Verifica que el hash se haya generado correctamente</li>
            <li>El botón de Bold debería aparecer automáticamente cuando el hash esté listo</li>
            <li>Haz clic en el botón para probar la integración</li>
            <li><strong>Revisa la consola del navegador (F12) y busca mensajes que empiecen con "Bold Payment Button:" o "BTN-"</strong></li>
            <li>Si aparece BTN-001, revisa los logs en la consola para ver qué atributo está causando el problema</li>
          </ol>
        </div>

        {/* Link a prueba HTML simple */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">Prueba HTML Simple:</h3>
          <p className="text-sm text-gray-700 mb-2">
            Para aislar el problema, prueba también esta página HTML simple sin React:
          </p>
          <a 
            href="/test-bold-plain.html" 
            target="_blank"
            className="text-blue-600 hover:underline font-medium"
          >
            Abrir /test-bold-plain.html en nueva pestaña
          </a>
          <p className="text-xs text-gray-600 mt-2">
            Si el botón simple en HTML también da BTN-001, el problema está en la API key o configuración de Bold, no en el código.
          </p>
        </div>

        {/* Botón para regenerar */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setBoldHash(null);
              setBoldOrderId(null);
              setIsLoadingHash(false);
              if (boldButtonRef.current) {
                boldButtonRef.current.innerHTML = '';
              }
              // Recargar la página para regenerar
              window.location.reload();
            }}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
          >
            Regenerar Hash y Botón
          </button>
        </div>
      </div>
    </div>
  );
}

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount, currency } = await request.json();

    // Validar que se reciban los parámetros necesarios
    if (!orderId || amount === undefined || !currency) {
      return NextResponse.json(
        { error: 'Missing required parameters: orderId, amount, currency' },
        { status: 400 }
      );
    }

    // Obtener la llave secreta desde las variables de entorno
    // Usar la clave de test si estamos en desarrollo, producción si estamos en producción
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Intentar obtener la clave secreta según el entorno
    let secretKey = isDevelopment 
      ? process.env.BOLD_SECRET_KEY_TEST 
      : process.env.BOLD_SECRET_KEY;
    
    // Si no hay clave de producción pero hay de test, usar la de test como fallback
    // Esto permite que funcione en producción con claves de test si no están configuradas las de producción
    if (!secretKey && process.env.BOLD_SECRET_KEY_TEST) {
      console.warn('⚠️ Usando BOLD_SECRET_KEY_TEST en producción (BOLD_SECRET_KEY no configurada)');
      secretKey = process.env.BOLD_SECRET_KEY_TEST;
    }

    if (!secretKey) {
      console.error('❌ Bold secret key not configured. NODE_ENV:', process.env.NODE_ENV);
      console.error('❌ Variables disponibles:', {
        hasTestKey: !!process.env.BOLD_SECRET_KEY_TEST,
        hasProdKey: !!process.env.BOLD_SECRET_KEY,
        nodeEnv: process.env.NODE_ENV
      });
      return NextResponse.json(
        { error: 'Bold secret key not configured. Please configure BOLD_SECRET_KEY_TEST (development) or BOLD_SECRET_KEY (production)' },
        { status: 500 }
      );
    }
    
    console.log('🔑 Using Bold secret key:', {
      environment: isDevelopment ? 'development' : 'production',
      keyLength: secretKey.length,
      keySource: isDevelopment ? 'BOLD_SECRET_KEY_TEST' : (process.env.BOLD_SECRET_KEY ? 'BOLD_SECRET_KEY' : 'BOLD_SECRET_KEY_TEST (fallback)')
    });

    // Asegurar que amount sea un número entero sin decimales
    const amountInt = Math.round(Number(amount));
    
    // Concatenar: {Identificador}{Monto}{Divisa}{LlaveSecreta}
    // IMPORTANTE: El orden y formato deben ser exactos
    const concatenatedString = `${orderId}${amountInt}${currency}${secretKey}`;

    // Log para debugging (sin mostrar la clave secreta completa)
    console.log('🔐 [BOLD HASH API] Generando hash:', {
      orderId,
      amount: amountInt,
      amountType: typeof amountInt,
      amountIsInteger: Number.isInteger(amountInt),
      currency,
      secretKeyLength: secretKey.length,
      secretKeySource: isDevelopment ? 'BOLD_SECRET_KEY_TEST' : (process.env.BOLD_SECRET_KEY ? 'BOLD_SECRET_KEY' : 'BOLD_SECRET_KEY_TEST (fallback)'),
      concatenatedLength: concatenatedString.length,
      concatenatedPreview: `${orderId}${amountInt}${currency}${secretKey.substring(0, 10)}...`,
      nodeEnv: process.env.NODE_ENV
    });

    // Generar hash SHA-256
    const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');
    
    console.log('✅ [BOLD HASH API] Hash generado:', {
      hashLength: hash.length,
      hashFormat: /^[a-f0-9]{64}$/i.test(hash),
      hashPreview: hash.substring(0, 20) + '...'
    });

    return NextResponse.json({ hash });
  } catch (error: any) {
    console.error('Error generating Bold hash:', error);
    return NextResponse.json(
      { error: 'Error generating hash', message: error.message },
      { status: 500 }
    );
  }
}


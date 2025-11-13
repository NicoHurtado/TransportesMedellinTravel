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
    const secretKey = isDevelopment 
      ? process.env.BOLD_SECRET_KEY_TEST 
      : process.env.BOLD_SECRET_KEY;

    if (!secretKey) {
      console.error('Bold secret key not configured. NODE_ENV:', process.env.NODE_ENV);
      return NextResponse.json(
        { error: 'Bold secret key not configured' },
        { status: 500 }
      );
    }

    // Asegurar que amount sea un número entero sin decimales
    const amountInt = Math.round(Number(amount));
    
    // Concatenar: {Identificador}{Monto}{Divisa}{LlaveSecreta}
    // IMPORTANTE: El orden y formato deben ser exactos
    const concatenatedString = `${orderId}${amountInt}${currency}${secretKey}`;

    // Log para debugging (sin mostrar la clave secreta completa)
    console.log('Generating Bold hash:', {
      orderId,
      amount: amountInt,
      currency,
      secretKeyLength: secretKey.length,
      concatenatedLength: concatenatedString.length
    });

    // Generar hash SHA-256
    const hash = crypto.createHash('sha256').update(concatenatedString).digest('hex');

    return NextResponse.json({ hash });
  } catch (error: any) {
    console.error('Error generating Bold hash:', error);
    return NextResponse.json(
      { error: 'Error generating hash', message: error.message },
      { status: 500 }
    );
  }
}


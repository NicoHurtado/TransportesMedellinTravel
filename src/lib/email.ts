import nodemailer from 'nodemailer';

// Configurar el transporter de Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export interface EmailData {
  to: string;
  codigoReserva: string;
  nombreContacto: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  numeroPasajeros: number;
  precioTotal: number;
  lugarRecogida?: string;
  origen?: string;
  destino?: string;
  trackingUrl: string;
  language?: 'es' | 'en'; // Idioma del email
}

export async function sendConfirmationEmail(data: EmailData) {
  try {
    const language = data.language || 'es';
    const emailHtml = generateEmailTemplate(data);

    const subject = language === 'en' 
      ? `✅ Booking Confirmation - ${data.codigoReserva}`
      : `✅ Confirmación de Reserva - ${data.codigoReserva}`;

    const mailOptions = {
      from: `"Medellín Travel Transportes" <${process.env.GMAIL_USER}>`,
      to: data.to.toLowerCase().trim(), // Normalizar email a lowercase
      subject,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado exitosamente:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    return { success: false, error };
  }
}

function generateEmailTemplate(data: EmailData): string {
  const {
    codigoReserva,
    nombreContacto,
    nombreServicio,
    fecha,
    hora,
    numeroPasajeros,
    precioTotal,
    lugarRecogida,
    origen,
    destino,
    trackingUrl,
    language = 'es',
  } = data;

  // Traducciones
  const t = {
    es: {
      title: '✓ Reserva Confirmada',
      company: 'Medellín Travel Transportes',
      greeting: 'Hola',
      thankYou: '¡Gracias por confiar en nosotros! Tu reserva ha sido confirmada exitosamente.',
      serviceDetails: '📋 Detalles de tu servicio',
      service: 'Servicio:',
      date: 'Fecha:',
      time: 'Hora:',
      passengers: 'Pasajeros:',
      person: 'persona',
      persons: 'personas',
      pickupLocation: 'Lugar de recogida:',
      origin: 'Origen:',
      destination: 'Destino:',
      total: 'Total:',
      quotePending: 'Cotización Pendiente',
      quotePendingNote: 'Un asesor te contactará pronto con el precio final',
      trackingText: 'Puedes rastrear el estado de tu reserva en tiempo real:',
      trackingButton: '🔍 Ver Estado de mi Reserva',
      importantInfo: '📌 Información importante',
      info1: 'Por favor llega 10 minutos antes de la hora programada',
      info2: 'Para cambios o cancelaciones, contáctanos con al menos 24 horas de anticipación',
      tagline: 'Tu experiencia en Medellín es nuestra prioridad',
      rights: 'Todos los derechos reservados.',
    },
    en: {
      title: '✓ Booking Confirmed',
      company: 'Medellín Travel Transportes',
      greeting: 'Hello',
      thankYou: 'Thank you for trusting us! Your reservation has been successfully confirmed.',
      serviceDetails: '📋 Service Details',
      service: 'Service:',
      date: 'Date:',
      time: 'Time:',
      passengers: 'Passengers:',
      person: 'person',
      persons: 'persons',
      pickupLocation: 'Pickup Location:',
      origin: 'Origin:',
      destination: 'Destination:',
      total: 'Total:',
      quotePending: 'Pending Quote',
      quotePendingNote: 'An advisor will contact you soon with the final price',
      trackingText: 'You can track your reservation status in real time:',
      trackingButton: '🔍 View My Reservation Status',
      importantInfo: '📌 Important Information',
      info1: 'Please arrive 10 minutes before the scheduled time',
      info2: 'For changes or cancellations, contact us at least 24 hours in advance',
      tagline: 'Your experience in Medellín is our priority',
      rights: 'All rights reserved.',
    },
  };

  const trans = t[language];

  // Formatear fecha
  const locale = language === 'en' ? 'en-US' : 'es-ES';
  const fechaFormateada = new Date(fecha).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Formatear precio
  const precioFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precioTotal);

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trans.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${trans.title}
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e0e0; font-size: 16px;">
                ${trans.company}
              </p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${trans.greeting} <strong>${nombreContacto}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                ${trans.thankYou}
              </p>
            </td>
          </tr>

          <!-- Detalles del Servicio -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid #000000;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 18px;">
                      ${trans.serviceDetails}
                    </h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          <strong style="color: #333333;">${trans.service}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0;">
                          ${nombreServicio}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.date}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${fechaFormateada}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.time}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${hora}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.passengers}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${numeroPasajeros} ${numeroPasajeros > 1 ? trans.persons : trans.person}
                        </td>
                      </tr>
                      ${
                        lugarRecogida
                          ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.pickupLocation}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${lugarRecogida}
                        </td>
                      </tr>
                      `
                          : ''
                      }
                      ${
                        origen && destino
                          ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.origin}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${origen}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.destination}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${destino}
                        </td>
                      </tr>
                      `
                          : ''
                      }
                      ${precioTotal > 0 ? `
                      <tr>
                        <td style="color: #666666; font-size: 16px; padding: 12px 0; border-top: 2px solid #000000;">
                          <strong style="color: #000000;">${trans.total}</strong>
                        </td>
                        <td style="color: #000000; font-size: 18px; font-weight: bold; text-align: right; padding: 12px 0; border-top: 2px solid #000000;">
                          ${precioFormateado}
                        </td>
                      </tr>
                      ` : `
                      <tr>
                        <td colspan="2" style="color: #666666; font-size: 14px; padding: 12px 0; border-top: 2px solid #000000; text-align: center;">
                          <strong style="color: #000000;">${trans.quotePending}</strong><br/>
                          <span style="font-size: 12px;">${trans.quotePendingNote}</span>
                        </td>
                      </tr>
                      `}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Botón de Tracking -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px;">
                ${trans.trackingText}
              </p>
              <a href="${trackingUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                ${trans.trackingButton}
              </a>
            </td>
          </tr>

          <!-- Información Adicional -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0;">
              <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">
                ${trans.importantInfo}
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                <li>${trans.info1}</li>
                <li>${trans.info2}</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #000000; color: #ffffff;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                ${trans.company}
              </p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #cccccc;">
                ${trans.tagline}
              </p>
              <p style="margin: 0; font-size: 13px; color: #999999;">
                📞 WhatsApp: +57 317 517 7409<br/>
                📧 ${process.env.GMAIL_USER}
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #666666;">
                © ${new Date().getFullYear()} ${trans.company}. ${trans.rights}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export interface StatusUpdateEmailData {
  to: string;
  nombreContacto: string;
  codigoReserva: string;
  nombreServicio: string;
  estadoAnterior: string;
  estadoNuevo: string;
  trackingUrl: string;
  language?: 'es' | 'en';
}

export async function sendStatusUpdateEmail(data: StatusUpdateEmailData) {
  try {
    const language = data.language || 'es';
    const emailHtml = generateStatusUpdateEmailTemplate(data);

    const subject = language === 'en' 
      ? `📢 Service Update - ${data.codigoReserva}`
      : `📢 Actualización de Servicio - ${data.codigoReserva}`;

    const mailOptions = {
      from: `"Medellín Travel Transportes" <${process.env.GMAIL_USER}>`,
      to: data.to.toLowerCase(), // Normalizar a lowercase para case-insensitive
      subject,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de actualización enviado exitosamente:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error al enviar email de actualización:', error);
    return { success: false, error };
  }
}

function generateStatusUpdateEmailTemplate(data: StatusUpdateEmailData): string {
  const {
    nombreContacto,
    codigoReserva,
    nombreServicio,
    estadoAnterior,
    estadoNuevo,
    trackingUrl,
    language = 'es',
  } = data;

  // Traducciones
  const t = {
    es: {
      title: '📢 Actualización de Servicio',
      greeting: 'Hola',
      message: 'Te informamos que ha habido una actualización en el estado de tu reserva.',
      serviceDetails: '📋 Detalles de tu servicio',
      service: 'Servicio:',
      reservationCode: 'Código de Reserva:',
      previousStatus: 'Estado Anterior:',
      newStatus: 'Estado Actual:',
      trackingText: 'Puedes ver todos los detalles y rastrear el estado de tu reserva:',
      trackingButton: '🔍 Ver Estado de mi Reserva',
      statusLabels: {
        pendiente_por_cotizacion: 'Pendiente por Cotización',
        agendada_con_cotizacion: 'Agendada con Cotización',
        asignada: 'Asignada',
        completada: 'Completada',
        cancelada: 'Cancelada',
        // Estados antiguos para compatibilidad
        pendiente: 'Pendiente de Cotización',
        confirmada: 'Confirmada',
      },
      tagline: 'Tu experiencia en Medellín es nuestra prioridad',
      rights: 'Todos los derechos reservados.',
    },
    en: {
      title: '📢 Service Update',
      greeting: 'Hello',
      message: 'We inform you that there has been an update to your reservation status.',
      serviceDetails: '📋 Service Details',
      service: 'Service:',
      reservationCode: 'Reservation Code:',
      previousStatus: 'Previous Status:',
      newStatus: 'Current Status:',
      trackingText: 'You can view all details and track your reservation status:',
      trackingButton: '🔍 View My Reservation Status',
      statusLabels: {
        pendiente_por_cotizacion: 'Pending Quote',
        agendada_con_cotizacion: 'Scheduled with Quote',
        asignada: 'Assigned',
        completada: 'Completed',
        cancelada: 'Cancelled',
        // Estados antiguos para compatibilidad
        pendiente: 'Pending Quote',
        confirmada: 'Confirmed',
      },
      tagline: 'Your experience in Medellín is our priority',
      rights: 'All rights reserved.',
    },
  };

  const trans = t[language];
  const estadoAnteriorLabel = trans.statusLabels[estadoAnterior as keyof typeof trans.statusLabels] || estadoAnterior;
  const estadoNuevoLabel = trans.statusLabels[estadoNuevo as keyof typeof trans.statusLabels] || estadoNuevo;

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trans.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #000000 0%, #333333 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${trans.title}
              </h1>
              <p style="margin: 10px 0 0 0; color: #e0e0e0; font-size: 16px;">
                Medellín Travel Transportes
              </p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${trans.greeting} <strong>${nombreContacto}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                ${trans.message}
              </p>
            </td>
          </tr>

          <!-- Detalles del Servicio -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid #000000;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 18px;">
                      ${trans.serviceDetails}
                    </h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          <strong style="color: #333333;">${trans.service}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0;">
                          ${nombreServicio}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.reservationCode}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${codigoReserva}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.previousStatus}</strong>
                        </td>
                        <td style="color: #666666; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${estadoAnteriorLabel}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 16px; padding: 12px 0; border-top: 2px solid #000000;">
                          <strong style="color: #000000;">${trans.newStatus}</strong>
                        </td>
                        <td style="color: #000000; font-size: 18px; font-weight: bold; text-align: right; padding: 12px 0; border-top: 2px solid #000000;">
                          ${estadoNuevoLabel}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Botón de Tracking -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px;">
                ${trans.trackingText}
              </p>
              <a href="${trackingUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                ${trans.trackingButton}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #000000; color: #ffffff;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                Medellín Travel Transportes
              </p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #cccccc;">
                ${trans.tagline}
              </p>
              <p style="margin: 0; font-size: 13px; color: #999999;">
                📞 WhatsApp: +57 317 517 7409<br/>
                📧 ${process.env.GMAIL_USER}
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #666666;">
                © ${new Date().getFullYear()} Medellín Travel Transportes. ${trans.rights}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export interface PaymentConfirmationEmailData {
  to: string;
  nombreContacto: string;
  codigoReserva: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  numeroPasajeros: number;
  precioTotal: number;
  lugarRecogida?: string;
  origen?: string;
  destino?: string;
  trackingUrl: string;
  boldOrderId: string;
  boldTransactionId?: string;
  language?: 'es' | 'en';
}

export async function sendPaymentConfirmationEmail(data: PaymentConfirmationEmailData) {
  try {
    const language = data.language || 'es';
    const emailHtml = generatePaymentConfirmationEmailTemplate(data);

    const subject = language === 'en' 
      ? `💳 Payment Confirmed - ${data.codigoReserva}`
      : `💳 Pago Confirmado - ${data.codigoReserva}`;

    const mailOptions = {
      from: `"Medellín Travel Transportes" <${process.env.GMAIL_USER}>`,
      to: data.to.toLowerCase().trim(),
      subject,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de confirmación de pago enviado exitosamente:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error al enviar email de confirmación de pago:', error);
    return { success: false, error };
  }
}

function generatePaymentConfirmationEmailTemplate(data: PaymentConfirmationEmailData): string {
  const {
    nombreContacto,
    codigoReserva,
    nombreServicio,
    fecha,
    hora,
    numeroPasajeros,
    precioTotal,
    lugarRecogida,
    origen,
    destino,
    trackingUrl,
    boldOrderId,
    boldTransactionId,
    language = 'es',
  } = data;

  const t = {
    es: {
      title: '💳 Pago Confirmado',
      company: 'Medellín Travel Transportes',
      greeting: 'Hola',
      thankYou: '¡Excelente noticia! Tu pago ha sido procesado exitosamente.',
      paymentConfirmed: 'Tu reserva está confirmada y lista.',
      serviceDetails: '📋 Detalles de tu servicio',
      service: 'Servicio:',
      date: 'Fecha:',
      time: 'Hora:',
      passengers: 'Pasajeros:',
      person: 'persona',
      persons: 'personas',
      pickupLocation: 'Lugar de recogida:',
      origin: 'Origen:',
      destination: 'Destino:',
      total: 'Total pagado:',
      paymentDetails: '💳 Detalles del pago',
      orderId: 'ID de orden:',
      transactionId: 'ID de transacción:',
      trackingText: 'Puedes rastrear el estado de tu reserva en tiempo real:',
      trackingButton: '🔍 Ver Estado de mi Reserva',
      importantInfo: '📌 Información importante',
      info1: 'Por favor llega 10 minutos antes de la hora programada',
      info2: 'Para cambios o cancelaciones, contáctanos con al menos 24 horas de anticipación',
      tagline: 'Tu experiencia en Medellín es nuestra prioridad',
      rights: 'Todos los derechos reservados.',
    },
    en: {
      title: '💳 Payment Confirmed',
      company: 'Medellín Travel Transportes',
      greeting: 'Hello',
      thankYou: 'Great news! Your payment has been successfully processed.',
      paymentConfirmed: 'Your reservation is confirmed and ready.',
      serviceDetails: '📋 Service Details',
      service: 'Service:',
      date: 'Date:',
      time: 'Time:',
      passengers: 'Passengers:',
      person: 'person',
      persons: 'persons',
      pickupLocation: 'Pickup Location:',
      origin: 'Origin:',
      destination: 'Destination:',
      total: 'Total paid:',
      paymentDetails: '💳 Payment Details',
      orderId: 'Order ID:',
      transactionId: 'Transaction ID:',
      trackingText: 'You can track your reservation status in real time:',
      trackingButton: '🔍 View My Reservation Status',
      importantInfo: '📌 Important Information',
      info1: 'Please arrive 10 minutes before the scheduled time',
      info2: 'For changes or cancellations, contact us at least 24 hours in advance',
      tagline: 'Your experience in Medellín is our priority',
      rights: 'All rights reserved.',
    },
  };

  const trans = t[language];
  const locale = language === 'en' ? 'en-US' : 'es-ES';
  const fechaFormateada = new Date(fecha).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const precioFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precioTotal);

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trans.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header con badge de pago confirmado -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">💳</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${trans.title}
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                ${trans.company}
              </p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${trans.greeting} <strong>${nombreContacto}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                ${trans.thankYou}
              </p>
              <p style="margin: 10px 0 0 0; color: #10b981; font-size: 16px; font-weight: bold;">
                ${trans.paymentConfirmed}
              </p>
            </td>
          </tr>

          <!-- Detalles del Servicio -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid #10b981;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 18px;">
                      ${trans.serviceDetails}
                    </h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          <strong style="color: #333333;">${trans.service}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0;">
                          ${nombreServicio}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.date}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${fechaFormateada}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.time}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${hora}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.passengers}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${numeroPasajeros} ${numeroPasajeros > 1 ? trans.persons : trans.person}
                        </td>
                      </tr>
                      ${
                        lugarRecogida
                          ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.pickupLocation}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${lugarRecogida}
                        </td>
                      </tr>
                      `
                          : ''
                      }
                      ${
                        origen && destino
                          ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.origin}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${origen}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.destination}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          ${destino}
                        </td>
                      </tr>
                      `
                          : ''
                      }
                      <tr>
                        <td style="color: #666666; font-size: 16px; padding: 12px 0; border-top: 2px solid #10b981;">
                          <strong style="color: #000000;">${trans.total}</strong>
                        </td>
                        <td style="color: #10b981; font-size: 18px; font-weight: bold; text-align: right; padding: 12px 0; border-top: 2px solid #10b981;">
                          ${precioFormateado}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Detalles del Pago -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; border: 2px solid #10b981;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 18px;">
                      ${trans.paymentDetails}
                    </h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          <strong style="color: #333333;">${trans.orderId}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; font-family: monospace;">
                          ${boldOrderId}
                        </td>
                      </tr>
                      ${boldTransactionId ? `
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #d1fae5;">
                          <strong style="color: #333333;">${trans.transactionId}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #d1fae5; font-family: monospace;">
                          ${boldTransactionId}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Botón de Tracking -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <p style="margin: 0 0 20px 0; color: #666666; font-size: 15px;">
                ${trans.trackingText}
              </p>
              <a href="${trackingUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                ${trans.trackingButton}
              </a>
            </td>
          </tr>

          <!-- Información Adicional -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0;">
              <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">
                ${trans.importantInfo}
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                <li>${trans.info1}</li>
                <li>${trans.info2}</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #000000; color: #ffffff;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                ${trans.company}
              </p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #cccccc;">
                ${trans.tagline}
              </p>
              <p style="margin: 0; font-size: 13px; color: #999999;">
                📞 WhatsApp: +57 317 517 7409<br/>
                📧 ${process.env.GMAIL_USER}
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #666666;">
                © ${new Date().getFullYear()} ${trans.company}. ${trans.rights}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Email para cuando se agrega cotización
export interface QuotationAddedEmailData {
  to: string;
  nombreContacto: string;
  codigoReserva: string;
  nombreServicio: string;
  precioTotal: number;
  precioFinal: number;
  trackingUrl: string;
  language?: 'es' | 'en';
}

export async function sendQuotationAddedEmail(data: QuotationAddedEmailData) {
  try {
    const language = data.language || 'es';
    const emailHtml = generateQuotationAddedEmailTemplate(data);

    const subject = language === 'en' 
      ? `💰 Quotation Ready - ${data.codigoReserva}`
      : `💰 Cotización Lista - ${data.codigoReserva}`;

    const mailOptions = {
      from: `"Medellín Travel Transportes" <${process.env.GMAIL_USER}>`,
      to: data.to.toLowerCase().trim(),
      subject,
      html: emailHtml,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email de cotización agregada enviado exitosamente:', result.messageId);
    return { success: true, data: result };
  } catch (error) {
    console.error('❌ Error al enviar email de cotización agregada:', error);
    return { success: false, error };
  }
}

function generateQuotationAddedEmailTemplate(data: QuotationAddedEmailData): string {
  const {
    nombreContacto,
    codigoReserva,
    nombreServicio,
    precioTotal,
    precioFinal,
    trackingUrl,
    language = 'es',
  } = data;

  const t = {
    es: {
      title: '💰 Cotización Lista',
      company: 'Medellín Travel Transportes',
      greeting: 'Hola',
      thankYou: '¡Excelente noticia! Tu cotización está lista.',
      message: 'Ya tenemos la cotización para tu servicio. Puedes proceder con el pago cuando estés listo.',
      serviceDetails: '📋 Detalles de tu servicio',
      service: 'Servicio:',
      reservationCode: 'Código de Reserva:',
      total: 'Total:',
      paymentReady: '💳 Listo para Pagar',
      paymentMessage: 'Tu servicio está agendado y listo para el pago. Haz clic en el botón de abajo para ver los detalles y proceder con el pago.',
      trackingButton: '🔍 Ver Detalles y Pagar',
      importantInfo: '📌 Información importante',
      info1: 'Por favor completa el pago para confirmar tu reserva',
      info2: 'Para cambios o cancelaciones, contáctanos con al menos 24 horas de anticipación',
      tagline: 'Tu experiencia en Medellín es nuestra prioridad',
      rights: 'Todos los derechos reservados.',
    },
    en: {
      title: '💰 Quotation Ready',
      company: 'Medellín Travel Transportes',
      greeting: 'Hello',
      thankYou: 'Great news! Your quotation is ready.',
      message: 'We have the quotation for your service. You can proceed with payment when you are ready.',
      serviceDetails: '📋 Service Details',
      service: 'Service:',
      reservationCode: 'Reservation Code:',
      total: 'Total:',
      paymentReady: '💳 Ready to Pay',
      paymentMessage: 'Your service is scheduled and ready for payment. Click the button below to view details and proceed with payment.',
      trackingButton: '🔍 View Details and Pay',
      importantInfo: '📌 Important Information',
      info1: 'Please complete payment to confirm your reservation',
      info2: 'For changes or cancellations, contact us at least 24 hours in advance',
      tagline: 'Your experience in Medellín is our priority',
      rights: 'All rights reserved.',
    },
  };

  const trans = t[language];
  const precioFormateado = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(precioFinal);

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trans.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">💰</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${trans.title}
              </h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">
                ${trans.company}
              </p>
            </td>
          </tr>

          <!-- Saludo -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; color: #333333; font-size: 16px; line-height: 1.6;">
                ${trans.greeting} <strong>${nombreContacto}</strong>,
              </p>
              <p style="margin: 15px 0 0 0; color: #666666; font-size: 15px; line-height: 1.6;">
                ${trans.thankYou}
              </p>
              <p style="margin: 10px 0 0 0; color: #3b82f6; font-size: 16px; font-weight: bold;">
                ${trans.message}
              </p>
            </td>
          </tr>

          <!-- Detalles del Servicio -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 15px 0; color: #000000; font-size: 18px;">
                      ${trans.serviceDetails}
                    </h2>
                    
                    <table width="100%" cellpadding="8" cellspacing="0">
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0;">
                          <strong style="color: #333333;">${trans.service}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0;">
                          ${nombreServicio}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 14px; padding: 8px 0; border-top: 1px solid #e0e0e0;">
                          <strong style="color: #333333;">${trans.reservationCode}</strong>
                        </td>
                        <td style="color: #000000; font-size: 14px; text-align: right; padding: 8px 0; border-top: 1px solid #e0e0e0; font-family: monospace;">
                          ${codigoReserva}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #666666; font-size: 16px; padding: 12px 0; border-top: 2px solid #3b82f6;">
                          <strong style="color: #000000;">${trans.total}</strong>
                        </td>
                        <td style="color: #3b82f6; font-size: 18px; font-weight: bold; text-align: right; padding: 12px 0; border-top: 2px solid #3b82f6;">
                          ${precioFormateado}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Sección de Pago -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 8px; padding: 20px; border: 2px solid #3b82f6;">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 10px 0; color: #000000; font-size: 18px;">
                      ${trans.paymentReady}
                    </h2>
                    <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                      ${trans.paymentMessage}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Botón de Tracking -->
          <tr>
            <td style="padding: 0 30px 40px 30px; text-align: center;">
              <a href="${trackingUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: bold;">
                ${trans.trackingButton}
              </a>
            </td>
          </tr>

          <!-- Información Adicional -->
          <tr>
            <td style="padding: 30px; background-color: #f9f9f9; border-top: 1px solid #e0e0e0;">
              <h3 style="margin: 0 0 15px 0; color: #333333; font-size: 16px;">
                ${trans.importantInfo}
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 14px; line-height: 1.8;">
                <li>${trans.info1}</li>
                <li>${trans.info2}</li>
              </ul>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #000000; color: #ffffff;">
              <p style="margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">
                ${trans.company}
              </p>
              <p style="margin: 0 0 15px 0; font-size: 14px; color: #cccccc;">
                ${trans.tagline}
              </p>
              <p style="margin: 0; font-size: 13px; color: #999999;">
                📞 WhatsApp: +57 317 517 7409<br/>
                📧 ${process.env.GMAIL_USER}
              </p>
              <p style="margin: 15px 0 0 0; font-size: 12px; color: #666666;">
                © ${new Date().getFullYear()} ${trans.company}. ${trans.rights}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export { transporter };

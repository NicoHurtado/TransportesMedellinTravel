import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { HotelProvider } from '@/contexts/HotelContext';
import ConditionalHeader from '@/components/ConditionalHeader';
import ConditionalMain from '@/components/ConditionalMain';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Medellín Travel - Transporte Premium',
  description: 'Transporte premium para tu comodidad y tranquilidad en Medellín',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Cargar el script de Bold UNA VEZ antes de que se renderice cualquier contenido */}
        <Script
          src="https://checkout.bold.co/library/boldPaymentButton.js"
          strategy="beforeInteractive"
        />
        <LanguageProvider>
          <HotelProvider>
            <ConditionalHeader />
            <ConditionalMain>
              {children}
            </ConditionalMain>
          </HotelProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}


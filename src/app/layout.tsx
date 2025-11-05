import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/contexts/LanguageContext';
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
        <LanguageProvider>
          <ConditionalHeader />
          <ConditionalMain>
            {children}
          </ConditionalMain>
        </LanguageProvider>
      </body>
    </html>
  );
}


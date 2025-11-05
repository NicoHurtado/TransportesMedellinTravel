import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Panel - Medellín Travel',
  description: 'Panel operativo de Medellín Travel',
};

export default function PanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Panel layout without public header
  return <>{children}</>;
}


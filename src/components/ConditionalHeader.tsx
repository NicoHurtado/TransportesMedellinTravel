'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on panel routes or landing page (it has its own header)
  if (pathname?.startsWith('/panel') || pathname === '/') {
    return null;
  }

  return <Header />;
}


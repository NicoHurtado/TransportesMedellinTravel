'use client';

import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Don't show header on panel routes
  if (pathname?.startsWith('/panel')) {
    return null;
  }

  return <Header />;
}


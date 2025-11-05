'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function ConditionalMain({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // No padding on panel routes
  const isPanel = pathname?.startsWith('/panel');

  return (
    <main className={isPanel ? '' : 'pt-16 sm:pt-20'}>
      {children}
    </main>
  );
}


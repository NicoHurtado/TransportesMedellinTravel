'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';

export default function PanelDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    // Check auth
    const isAuth = localStorage.getItem('panel_auth');
    if (!isAuth) {
      router.push('/panel');
    }

    // Force Spanish language in panel
    if (language !== 'es') {
      toggleLanguage();
    }
  }, [router, language, toggleLanguage]);

  return <DashboardLayout>{children}</DashboardLayout>;
}


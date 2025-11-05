'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Inbox,
  Calendar,
  BarChart3,
  Database,
  Users,
  Car,
  Menu,
  X,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [activeView, setActiveView] = useState('trays');

  const menuItems = [
    { id: 'trays', icon: Inbox, label: t('trays'), href: '/panel/dashboard' },
    { id: 'calendar', icon: Calendar, label: t('calendar'), href: '/panel/dashboard/calendar' },
    { id: 'statistics', icon: BarChart3, label: t('statistics'), href: '/panel/dashboard/statistics' },
    { id: 'database', icon: Database, label: t('database'), href: '/panel/dashboard/database' },
    { id: 'partners', icon: Users, label: t('partners'), href: '/panel/dashboard/partners' },
    { id: 'drivers', icon: Car, label: t('drivers'), href: '/panel/dashboard/drivers' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-4 lg:px-6">
          {/* Left: Logo + Title */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl flex-shrink-0"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            <Image
              src="/medellintravel.png"
              alt="Medellín Travel"
              width={150}
              height={45}
              className="h-7 sm:h-8 w-auto hidden sm:block flex-shrink-0"
            />
            <div className="hidden md:block h-6 sm:h-8 w-px bg-gray-300 flex-shrink-0" />
            <h1 className="text-base sm:text-lg font-semibold hidden md:block truncate">
              {t('operationTitle')}
            </h1>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-14 sm:top-16 left-0 bottom-0 z-30 bg-white border-r-2 border-gray-300 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          sidebarHovered ? 'lg:w-72' : 'lg:w-20'
        } w-64 sm:w-72`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <nav className="p-3 sm:p-4 space-y-1 overflow-y-auto h-full overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all min-h-[44px] text-sm sm:text-base group ${
                  isActive
                    ? 'bg-black text-white'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                title={!sidebarHovered ? item.label : undefined}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className={`font-medium truncate transition-opacity duration-300 ${
                  sidebarHovered ? 'opacity-100' : 'lg:opacity-0 lg:w-0 lg:overflow-hidden'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className={`ml-auto w-2 h-2 bg-accent rounded-full flex-shrink-0 transition-opacity duration-300 ${
                    sidebarHovered ? 'opacity-100' : 'lg:opacity-0'
                  }`} />
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`pt-14 sm:pt-16 transition-all duration-300 ${
        sidebarHovered ? 'lg:ml-72' : 'lg:ml-20'
      }`}>
        <div className="p-3 sm:p-4 md:p-6 lg:p-8 lg:pl-10 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}


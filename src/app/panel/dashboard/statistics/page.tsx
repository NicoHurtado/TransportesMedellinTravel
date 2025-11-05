'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Users, DollarSign, CheckCircle, XCircle, Handshake } from 'lucide-react';
import { mockReservations } from '@/lib/mockData';

export default function StatisticsPage() {
  const { t } = useLanguage();

  // Calcular estadísticas desde los datos mock
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthReservations = mockReservations.filter(r => {
    const resDate = new Date(r.createdAt);
    return resDate.getMonth() === currentMonth && resDate.getFullYear() === currentYear;
  });

  const directReservations = monthReservations.filter(r => r.channel === 'direct').length;
  const partnerReservations = monthReservations.filter(r => r.channel === 'hotel' || r.channel === 'airbnb').length;
  const completedReservations = monthReservations.filter(r => r.status === 'completed').length;
  const cancelledReservations = monthReservations.filter(r => r.status === 'cancelled').length;
  
  const completedQuotesSum = monthReservations
    .filter(r => r.status === 'completed' && r.quote)
    .reduce((sum, r) => sum + (r.quote || 0), 0);
  
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    return `$${value.toLocaleString()}`;
  };

  const kpis = [
    { label: 'Reservas directas', value: directReservations.toString(), icon: Users, change: '+12%' },
    { label: 'Reservas a través de Aliado', value: partnerReservations.toString(), icon: Handshake, change: '+8%' },
    { label: 'Completadas', value: completedReservations.toString(), icon: CheckCircle, change: '+8%' },
    { label: 'Suma de cotizaciones neta en servicios finalizados', value: formatCurrency(completedQuotesSum), icon: DollarSign, change: '+15%' },
    { label: 'Servicios cancelados', value: cancelledReservations.toString(), icon: XCircle, change: '+5%' },
  ];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('statistics')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Métricas y análisis del negocio</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
                </div>
                <span className="text-green-600 text-xs sm:text-sm font-medium">{kpi.change}</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{kpi.value}</p>
              <p className="text-xs sm:text-sm text-gray-600 leading-tight">{kpi.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Reservas por día</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
            [Gráfico de línea]
          </div>
        </div>
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Servicios más solicitados</h3>
          <div className="h-48 sm:h-64 flex items-center justify-center text-gray-400 text-xs sm:text-sm">
            [Gráfico de barras]
          </div>
        </div>
      </div>
    </div>
  );
}


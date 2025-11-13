'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, DollarSign, CheckCircle, Handshake, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatisticsData {
  kpis: {
    directReservations: number;
    partnerReservations: number;
    completedReservations: number;
    netQuotesSum: number;
  };
  charts: {
    serviciosMasSolicitados: { nombre: string; count: number }[];
    cotizacionesPorServicio: { nombre: string; suma: number }[];
  };
  monthRange: {
    start: string;
    end: string;
    monthName: string;
  };
}

export default function StatisticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchStatistics();
  }, [selectedDate]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth() + 1; // getMonth() returns 0-11
      
      const response = await fetch(`/api/statistics?year=${year}&month=${month}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const formatCurrencyTooltip = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar las estadísticas</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { 
      label: 'Reservas directas', 
      value: data.kpis.directReservations.toString(), 
      icon: Users, 
      change: '+12%' 
    },
    { 
      label: 'Reservas a través de Aliado', 
      value: data.kpis.partnerReservations.toString(), 
      icon: Handshake, 
      change: '+8%' 
    },
    { 
      label: 'Completadas', 
      value: data.kpis.completedReservations.toString(), 
      icon: CheckCircle, 
      change: '+8%' 
    },
    { 
      label: 'Suma de cotizaciones neta en servicios pagados', 
      value: formatCurrency(data.kpis.netQuotesSum), 
      icon: DollarSign, 
      change: '+15%' 
    },
  ];

  const monthName = selectedDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const isCurrentMonth = 
    selectedDate.getMonth() === new Date().getMonth() && 
    selectedDate.getFullYear() === new Date().getFullYear();

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('statistics')}</h2>
            <p className="text-sm sm:text-base text-gray-600">Métricas y análisis del negocio</p>
          </div>
          
          {/* Navegación de mes */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center min-w-[200px]">
              <h3 className="text-lg font-semibold capitalize">{monthName}</h3>
              {data?.monthRange && (
                <p className="text-xs text-gray-500">
                  {data.monthRange.start} - {data.monthRange.end}
                </p>
              )}
            </div>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {!isCurrentMonth && (
              <button 
                onClick={goToCurrentMonth}
                className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Mes actual
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Gráfica de barras: Servicios más solicitados */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Servicios más solicitados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.serviciosMasSolicitados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="nombre" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfica de barras: Cotizaciones por servicio */}
        <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Cotizaciones por servicio</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.charts.cotizacionesPorServicio}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="nombre" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrencyTooltip(value)}
              />
              <Bar dataKey="suma" fill="#000" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

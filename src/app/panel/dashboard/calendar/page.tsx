'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Circle } from 'lucide-react';

interface ReservaCalendario {
  id: number;
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  estado: string;
  numeroPasajeros: number;
  nombreContacto: string;
  precioFinal: number | null;
}

export default function CalendarPage() {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [reservasPorFecha, setReservasPorFecha] = useState<{ [key: string]: ReservaCalendario[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reservations/calendar');
      const data = await response.json();

      if (data.success) {
        setReservasPorFecha(data.data);
      }
    } catch (error) {
      console.error('Error fetching calendar reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente_por_cotizacion':
        return 'bg-orange-500';
      case 'agendada_con_cotizacion':
        return 'bg-blue-500';
      case 'pagado':
        return 'bg-yellow-500';
      case 'asignada':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'pendiente_por_cotizacion':
        return 'Pendiente';
      case 'agendada_con_cotizacion':
        return 'Agendada';
      case 'pagado':
        return 'Pagado';
      case 'asignada':
        return 'Asignada';
      default:
        return estado;
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Días del mes anterior para completar la primera semana
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
      });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true,
      });
    }

    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('calendar')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Planificación visual de reservas</p>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-semibold capitalize">{monthName}</h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
              onClick={goToToday}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-black text-white rounded-xl text-sm sm:text-base font-medium min-h-[44px]"
            >
              {t('today')}
            </button>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-xl flex-shrink-0"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <button 
            onClick={() => setViewMode('week')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium whitespace-nowrap min-h-[44px] ${
              viewMode === 'week' 
                ? 'bg-black text-white' 
                : 'bg-white border-2 border-gray-200 hover:border-black'
            }`}
          >
            Semana
          </button>
          <button 
            onClick={() => setViewMode('month')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-sm sm:text-base font-medium whitespace-nowrap min-h-[44px] ${
              viewMode === 'month' 
                ? 'bg-black text-white' 
                : 'bg-white border-2 border-gray-200 hover:border-black'
            }`}
          >
            Mes
          </button>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' && (
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b-2 border-gray-200">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Cargando reservas...</p>
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {days.map((day, index) => {
                  const dateKey = formatDateKey(day.date);
                  const reservasDelDia = reservasPorFecha[dateKey] || [];
                  const today = isToday(day.date);

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] border-r border-b border-gray-200 p-2 ${
                        !day.isCurrentMonth ? 'bg-gray-50' : today ? 'bg-blue-50/30' : 'bg-white'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 relative ${
                        !day.isCurrentMonth ? 'text-gray-400' : today ? 'text-blue-600 font-bold' : 'text-gray-900'
                      }`}>
                        {today && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
                        )}
                        {day.date.getDate()}
                      </div>
                      
                      {/* Indicadores de reservas */}
                      <div className="space-y-1">
                        {reservasDelDia.slice(0, 3).map((reserva, idx) => (
                          <div
                            key={idx}
                            className={`text-xs px-1.5 py-0.5 rounded ${getEstadoColor(reserva.estado)} text-white truncate`}
                            title={`${reserva.codigoReserva} - ${reserva.nombreServicio} - ${reserva.hora} - ${getEstadoLabel(reserva.estado)}`}
                          >
                            <div className="font-semibold truncate">{reserva.nombreServicio}</div>
                            <div className="font-mono text-[10px] opacity-90 truncate">{reserva.codigoReserva}</div>
                          </div>
                        ))}
                        {reservasDelDia.length > 3 && (
                          <div className="text-xs text-gray-600 font-medium">
                            +{reservasDelDia.length - 3} más
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Vista de Semana */}
        {viewMode === 'week' && (
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b-2 border-gray-200">
              {weekDays.map(day => (
                <div key={day} className="p-3 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Get current week days */}
            {(() => {
              const today = new Date();
              const currentDay = today.getDay();
              const startOfWeek = new Date(today);
              startOfWeek.setDate(today.getDate() - currentDay);
              
              const weekDaysArray = [];
              for (let i = 0; i < 7; i++) {
                const day = new Date(startOfWeek);
                day.setDate(startOfWeek.getDate() + i);
                weekDaysArray.push(day);
              }

              return (
                <div className="grid grid-cols-7">
                  {weekDaysArray.map((day, index) => {
                    const dateKey = formatDateKey(day);
                    const reservasDelDia = reservasPorFecha[dateKey] || [];
                    const isTodayDate = isToday(day);
                    const dayName = weekDays[index];

                    return (
                      <div
                        key={index}
                        className={`min-h-[400px] border-r border-gray-200 p-3 ${
                          isTodayDate ? 'bg-blue-50/30 border-l-4 border-l-blue-600' : 'bg-white'
                        } last:border-r-0`}
                      >
                        <div className={`text-sm font-medium mb-2 flex items-center gap-2 ${
                          isTodayDate ? 'text-blue-600 font-bold' : 'text-gray-900'
                        }`}>
                          {isTodayDate && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                          <span>{dayName}</span>
                          <span className="text-xs text-gray-500">({day.getDate()}/{day.getMonth() + 1})</span>
                        </div>
                        
                        {/* Reservas del día */}
                        <div className="space-y-2">
                          {loading ? (
                            <div className="text-center py-4">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mx-auto"></div>
                            </div>
                          ) : reservasDelDia.length > 0 ? (
                            reservasDelDia.map((reserva, idx) => (
                              <div
                                key={idx}
                                className={`text-xs px-2 py-1.5 rounded ${getEstadoColor(reserva.estado)} text-white`}
                                title={`${reserva.codigoReserva} - ${reserva.nombreServicio} - ${reserva.hora} - ${getEstadoLabel(reserva.estado)}`}
                              >
                                <div className="font-semibold truncate">{reserva.nombreServicio}</div>
                                <div className="font-mono text-[10px] opacity-90 truncate">{reserva.codigoReserva}</div>
                                <div className="text-[10px] opacity-80 mt-0.5">{reserva.hora}</div>
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-gray-400 text-center py-2">Sin reservas</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm font-semibold mb-3">Leyenda de Estados:</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500"></div>
              <span className="text-sm">Pendiente por cotización</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-sm">Agendada con cotización</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-500"></div>
              <span className="text-sm">Pagado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-sm">Asignada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

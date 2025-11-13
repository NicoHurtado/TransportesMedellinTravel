'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Download, Filter, X, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import UnifiedReservationDetail from '@/components/Dashboard/UnifiedReservationDetail';

interface UnifiedReservation {
  id: string;
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: Date | string;
  hora?: Date | string;
  numeroPasajeros?: number;
  nombreContacto: string;
  telefonoContacto?: string;
  emailContacto?: string;
  precioTotal?: number;
  precioFinal?: number;
  estado: string;
  hotel?: string | null;
  conductorAsignado?: string | null;
  vehiculoAsignado?: string | null;
  createdAt: Date | string;
  origen?: string;
  destino?: string;
  lugarRecogida?: string;
  vehiculo?: string;
  canal?: string;
  idioma?: string;
  numero_contacto?: string;
  cotizacion?: string;
  estado_servicio?: string;
  estado_pago?: string;
  servicio?: string;
  fuente: 'nueva' | 'antigua';
  rawData?: any;
}

export default function DatabasePage() {
  const { t } = useLanguage();
  const [reservations, setReservations] = useState<UnifiedReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // 'desc' = más reciente primero, 'asc' = más vieja primero
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [selectedReservation, setSelectedReservation] = useState<UnifiedReservation | null>(null);

  // Obtener valores únicos para filtros
  const [uniqueServices, setUniqueServices] = useState<string[]>([]);
  const [uniqueChannels, setUniqueChannels] = useState<string[]>([]);
  const [uniqueStatuses, setUniqueStatuses] = useState<string[]>([]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '50');
      params.append('sortOrder', sortOrder);
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus !== 'all') params.append('estado', selectedStatus);
      if (selectedService !== 'all') params.append('servicio', selectedService);
      if (selectedChannel) params.append('canal', selectedChannel);
      if (dateFrom) params.append('fechaDesde', dateFrom);
      if (dateTo) params.append('fechaHasta', dateTo);

      const response = await fetch(`/api/reservations/unified?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReservations(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
        
        // Extraer valores únicos para filtros
        const services = new Set<string>();
        const channels = new Set<string>();
        const statuses = new Set<string>();
        
        data.data.forEach((r: UnifiedReservation) => {
          if (r.nombreServicio) services.add(r.nombreServicio);
          if (r.canal) channels.add(r.canal);
          if (r.estado) statuses.add(r.estado);
        });
        
        setUniqueServices(Array.from(services).sort());
        setUniqueChannels(Array.from(channels).sort());
        setUniqueStatuses(Array.from(statuses).sort());
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [page, searchTerm, selectedStatus, selectedService, selectedChannel, dateFrom, dateTo, sortOrder]);

  const formatDate = (date: Date | string) => {
    if (!date) return '-';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleExportCSV = () => {
    const headers = ['Código', 'Fecha', 'Servicio', 'Cliente', 'Estado', 'Canal', 'Teléfono', 'Email', 'Conductor'];
    const rows = reservations.map(r => [
      r.codigoReserva,
      formatDate(r.fecha),
      r.nombreServicio,
      r.nombreContacto,
      r.estado,
      r.canal || '-',
      r.telefonoContacto || '-',
      r.emailContacto || '-',
      r.conductorAsignado || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reservas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedService('all');
    setSelectedChannel('');
    setDateFrom('');
    setDateTo('');
    setPage(0);
  };

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedStatus !== 'all' ? 1 : 0,
    selectedService !== 'all' ? 1 : 0,
    selectedChannel ? 1 : 0,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('database')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Base de datos completa de reservas (nuevas y antiguas)</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-xl">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Buscar por código, cliente, origen..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="flex-1 bg-transparent outline-none text-sm sm:text-base"
              />
            </div>
            <button
              onClick={() => {
                setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                setPage(0);
              }}
              className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-black transition-colors flex items-center gap-2 justify-center min-h-[44px] whitespace-nowrap"
              title={sortOrder === 'desc' ? 'Más reciente primero' : 'Más antigua primero'}
            >
              {sortOrder === 'desc' ? (
                <>
                  <ArrowDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Más reciente</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Más antigua</span>
                </>
              )}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 sm:px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm sm:text-base font-medium hover:border-black transition-colors flex items-center gap-2 justify-center min-h-[44px] relative whitespace-nowrap"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Filtros</span>
              <span className="sm:hidden">Filtros</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 sm:px-4 py-2 bg-black text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-800 flex items-center gap-2 justify-center min-h-[44px] whitespace-nowrap"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Exportar CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                >
                  <option value="all">Todos</option>
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Servicio</label>
                <select
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                >
                  <option value="all">Todos</option>
                  {uniqueServices.map(service => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Canal</label>
                <select
                  value={selectedChannel}
                  onChange={(e) => {
                    setSelectedChannel(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                >
                  <option value="">Todos</option>
                  {uniqueChannels.map(channel => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                />
              </div>
              {activeFiltersCount > 0 && (
                <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-black flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando reservas...</div>
        ) : (
          <>
            <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Código
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Fecha
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Servicio
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Cliente
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Canal
                    </th>
                    <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Teléfono
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-3 sm:px-4 md:px-6 py-8 sm:py-12 text-center text-sm sm:text-base text-gray-500">
                        No se encontraron reservas con los filtros aplicados
                      </td>
                    </tr>
                  ) : (
                    reservations.map((reservation) => (
                      <tr
                        key={reservation.id}
                        onClick={() => setSelectedReservation(reservation)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                          <span className="font-medium text-sm sm:text-base">{reservation.codigoReserva}</span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                          {formatDate(reservation.fecha)}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">{reservation.nombreServicio}</td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">{reservation.nombreContacto}</td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                          {reservation.canal || '-'}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                          {reservation.telefonoContacto || reservation.numero_contacto || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {page * 50 + 1} - {Math.min((page + 1) * 50, total)} de {total} reservas
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="p-2 border-2 border-gray-200 rounded-xl hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium px-3">
                    Página {page + 1} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-2 border-2 border-gray-200 rounded-xl hover:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReservation && (
        <UnifiedReservationDetail
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
}

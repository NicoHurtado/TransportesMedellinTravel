'use client';

import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { mockReservations, type Reservation } from '@/lib/mockData';
import { Search, Download, ChevronUp, ChevronDown, Filter, X } from 'lucide-react';
import ReservationDetail from '@/components/Dashboard/ReservationDetail';

type SortField = 'code' | 'date' | 'service' | 'customerName' | 'status';
type SortDirection = 'asc' | 'desc' | null;

export default function DatabasePage() {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const uniqueServices = useMemo(() => {
    const services = new Set(mockReservations.map(r => r.service));
    return Array.from(services).sort();
  }, []);

  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'toBeQuoted', label: t('toBeQuoted') },
    { value: 'scheduled', label: t('scheduled') },
    { value: 'assigned', label: t('assigned') },
    { value: 'completed', label: t('completed') },
    { value: 'cancelled', label: t('cancelled') },
  ];

  const channelOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'direct', label: 'Directo' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'airbnb', label: 'Airbnb' },
  ];

  // Filter and sort reservations
  const filteredAndSortedReservations = useMemo(() => {
    let filtered = [...mockReservations];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.code.toLowerCase().includes(term) ||
        r.customerName.toLowerCase().includes(term) ||
        r.from.toLowerCase().includes(term) ||
        r.to.toLowerCase().includes(term) ||
        r.service.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    // Service filter
    if (selectedService !== 'all') {
      filtered = filtered.filter(r => r.service === selectedService);
    }

    // Channel filter
    if (selectedChannel !== 'all') {
      filtered = filtered.filter(r => r.channel === selectedChannel);
    }

    // Date filters
    if (dateFrom) {
      filtered = filtered.filter(r => {
        const reservationDate = new Date(r.date);
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        return reservationDate >= fromDate;
      });
    }

    if (dateTo) {
      filtered = filtered.filter(r => {
        const reservationDate = new Date(r.date);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        return reservationDate <= toDate;
      });
    }

    // Sort
    if (sortField && sortDirection) {
      filtered.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortField) {
          case 'code':
            aValue = a.code;
            bValue = b.code;
            break;
          case 'date':
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case 'service':
            aValue = a.service;
            bValue = b.service;
            break;
          case 'customerName':
            aValue = a.customerName;
            bValue = b.customerName;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [searchTerm, selectedStatus, selectedService, selectedChannel, dateFrom, dateTo, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection('asc');
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronUp className="w-4 h-4 text-gray-400 opacity-0" />;
    }
    if (sortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-black" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="w-4 h-4 text-black" />;
    }
    return <ChevronUp className="w-4 h-4 text-gray-400 opacity-0" />;
  };

  const handleExportCSV = () => {
    const headers = ['Código', 'Fecha', 'Servicio', 'Cliente', 'Estado', 'Origen', 'Destino', 'Pasajeros', 'Teléfono', 'Email'];
    const rows = filteredAndSortedReservations.map(r => [
      r.code,
      r.date,
      r.service,
      r.customerName,
      t(r.status as any),
      r.from,
      r.to,
      r.passengers.toString(),
      r.customerPhone,
      r.customerEmail,
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
    setSelectedChannel('all');
    setDateFrom('');
    setDateTo('');
    setSortField(null);
    setSortDirection(null);
  };

  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    selectedStatus !== 'all' ? 1 : 0,
    selectedService !== 'all' ? 1 : 0,
    selectedChannel !== 'all' ? 1 : 0,
    dateFrom ? 1 : 0,
    dateTo ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-2">{t('database')}</h2>
        <p className="text-sm sm:text-base text-gray-600">Base de datos completa de reservas</p>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm sm:text-base"
              />
            </div>
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
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Servicio</label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
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
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                >
                  {channelOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha desde</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fecha hasta</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
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
        <div className="overflow-x-auto -mx-3 sm:-mx-4 md:-mx-6 lg:-mx-8 px-3 sm:px-4 md:px-6 lg:px-8">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('code')}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    Código
                    {getSortIcon('code')}
                  </div>
                </th>
                <th
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    Fecha
                    {getSortIcon('date')}
                  </div>
                </th>
                <th
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('service')}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    Servicio
                    {getSortIcon('service')}
                  </div>
                </th>
                <th
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    Cliente
                    {getSortIcon('customerName')}
                  </div>
                </th>
                <th
                  className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    Estado
                    {getSortIcon('status')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAndSortedReservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 sm:px-4 md:px-6 py-8 sm:py-12 text-center text-sm sm:text-base text-gray-500">
                    No se encontraron reservas con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredAndSortedReservations.map((reservation) => (
                  <tr
                    key={reservation.id}
                    onClick={() => setSelectedReservation(reservation)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <span className="font-medium text-sm sm:text-base">{reservation.code}</span>
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                      {reservation.date}
                    </td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">{reservation.service}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm">{reservation.customerName}</td>
                    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
                      <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gray-100">
                        {t(reservation.status as any)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedReservation && (
        <ReservationDetail
          reservation={selectedReservation}
          onClose={() => setSelectedReservation(null)}
        />
      )}
    </div>
  );
}

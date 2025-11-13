'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Filter, 
  Search, 
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package
} from 'lucide-react';

interface Reserva {
  id: number;
  codigoReserva: string;
  tipoServicio: string;
  nombreServicio: string;
  fecha: string;
  hora: string;
  numeroPasajeros: number;
  nombreContacto: string;
  telefonoContacto: string;
  emailContacto: string;
  precioTotal: number;
  precioFinal: number;
  estado: string;
  hotel: string | null;
  conductorAsignado: string | null;
  createdAt: string;
  origen?: string;
  destino?: string;
  lugarRecogida?: string;
  vehiculo?: string;
}

export default function DashboardPage() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [allReservas, setAllReservas] = useState<Reserva[]>([]); // Para calcular contadores
  const [loading, setLoading] = useState(true);
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [selectedServicio, setSelectedServicio] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar todas las reservas para contadores (sin filtro de estado)
  useEffect(() => {
    const fetchAllReservas = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedServicio !== 'all') params.append('servicio', selectedServicio);

        const response = await fetch(`/api/reservations/all?${params.toString()}`);
        const data = await response.json();

        if (data.success) {
          setAllReservas(data.data);
        }
      } catch (error) {
        console.error('Error fetching all reservations:', error);
      }
    };
    
    fetchAllReservas();
  }, [selectedServicio]);

  // Cargar reservas filtradas para mostrar en la tabla
  useEffect(() => {
    fetchReservas();
  }, [selectedEstado, selectedServicio]);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEstado !== 'all') params.append('estado', selectedEstado);
      if (selectedServicio !== 'all') params.append('servicio', selectedServicio);

      const response = await fetch(`/api/reservations/all?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setReservas(data.data);
      }
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar reservas según el término de búsqueda
  const filteredReservas = useMemo(() => {
    // Si no hay término de búsqueda, mostrar todas las reservas
    if (!searchTerm || searchTerm.trim() === '') {
      return reservas;
    }
    
    const search = searchTerm.trim().toLowerCase();
    
    // Filtrar reservas que coincidan en código, cliente o servicio
    return reservas.filter((reserva) => {
      // Obtener valores de los campos a buscar
      const codigo = String(reserva.codigoReserva || '').toLowerCase();
      const cliente = String(reserva.nombreContacto || '').toLowerCase();
      const servicio = String(reserva.nombreServicio || '').toLowerCase();
      
      // Buscar el término en cualquiera de los tres campos
      return codigo.includes(search) || cliente.includes(search) || servicio.includes(search);
    });
  }, [reservas, searchTerm]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente_por_cotizacion':
        return 'bg-orange-100 text-orange-800';
      case 'agendada_con_cotizacion':
        return 'bg-blue-100 text-blue-800';
      case 'pagado':
        return 'bg-yellow-100 text-yellow-800';
      case 'asignada':
        return 'bg-purple-100 text-purple-800';
      case 'completada':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente_por_cotizacion':
        return <Clock className="w-4 h-4" />;
      case 'agendada_con_cotizacion':
        return <CheckCircle className="w-4 h-4" />;
      case 'pagado':
        return <CheckCircle className="w-4 h-4" />;
      case 'asignada':
        return <Package className="w-4 h-4" />;
      case 'completada':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelada':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getEstadoLabel = (estado: string) => {
    const labels: Record<string, string> = {
      pendiente_por_cotizacion: 'Pendiente por cotización',
      agendada_con_cotizacion: 'Agendada con cotización - Esperando Pago',
      pagado: 'Pagado',
      asignada: 'Asignada',
      completada: 'Completada',
      cancelada: 'Cancelada',
    };
    return labels[estado] || estado;
  };

  const estadoCounts = {
    all: allReservas.length,
    pendiente_por_cotizacion: allReservas.filter((r) => r.estado === 'pendiente_por_cotizacion' || r.estado === 'pendiente').length,
    agendada_con_cotizacion: allReservas.filter((r) => r.estado === 'agendada_con_cotizacion' || r.estado === 'confirmada').length,
    pagado: allReservas.filter((r) => r.estado === 'pagado').length,
    asignada: allReservas.filter((r) => r.estado === 'asignada').length,
    completada: allReservas.filter((r) => r.estado === 'completada').length,
    cancelada: allReservas.filter((r) => r.estado === 'cancelada').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona todas las reservas y servicios
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <button
            onClick={() => setSelectedEstado('pendiente_por_cotizacion')}
            className={`p-4 rounded-xl transition-all ${
              selectedEstado === 'pendiente_por_cotizacion'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold">{estadoCounts.pendiente_por_cotizacion}</p>
            <p className="text-sm opacity-80">Pendientes</p>
          </button>

          <button
            onClick={() => setSelectedEstado('agendada_con_cotizacion')}
            className={`p-4 rounded-xl transition-all ${
              selectedEstado === 'agendada_con_cotizacion'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold">{estadoCounts.agendada_con_cotizacion}</p>
            <p className="text-sm opacity-80">Agendadas</p>
          </button>

          <button
            onClick={() => setSelectedEstado('pagado')}
            className={`p-4 rounded-xl transition-all ${
              selectedEstado === 'pagado'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-white hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold">{estadoCounts.pagado}</p>
            <p className="text-sm opacity-80">Pagadas</p>
          </button>

          <button
            onClick={() => setSelectedEstado('asignada')}
            className={`p-4 rounded-xl transition-all ${
              selectedEstado === 'asignada'
                ? 'bg-purple-500 text-white shadow-lg'
                : 'bg-white hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold">{estadoCounts.asignada}</p>
            <p className="text-sm opacity-80">Asignadas</p>
          </button>

          <button
            onClick={() => setSelectedEstado('completada')}
            className={`p-4 rounded-xl transition-all ${
              selectedEstado === 'completada'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-white hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold">{estadoCounts.completada}</p>
            <p className="text-sm opacity-80">Completadas</p>
          </button>

          <button
            onClick={() => setSelectedEstado('cancelada')}
            className={`p-4 rounded-xl transition-all ${
              selectedEstado === 'cancelada'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white hover:shadow-md'
            }`}
          >
            <p className="text-2xl font-bold">{estadoCounts.cancelada}</p>
            <p className="text-sm opacity-80">Canceladas</p>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por código, cliente, servicio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            {/* Service Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedServicio}
                onChange={(e) => setSelectedServicio(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black appearance-none bg-white"
              >
                <option value="all">Todos los servicios</option>
                <option value="airport-transfer">Transporte Aeropuerto</option>
                <option value="guatape-tour">Tour Guatapé</option>
                <option value="city-tour">City Tour</option>
                <option value="graffiti-tour">Comuna 13</option>
                <option value="hacienda-napoles-tour">Hacienda Nápoles</option>
                <option value="occidente-tour">Tour Occidente</option>
                <option value="parapente-tour">Parapente</option>
                <option value="atv-tour">ATV</option>
                <option value="jardin-tour">Jardín</option>
                <option value="coffee-farm-tour">Finca Cafetera</option>
              </select>
            </div>

          </div>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredReservas.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium mb-2">No hay reservas</p>
              <p className="text-sm">
                {searchTerm
                  ? 'No se encontraron resultados para tu búsqueda'
                  : 'Las reservas aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Pasajeros
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReservas.map((reserva) => (
                    <motion.tr
                      key={reserva.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => {
                        window.location.href = `/panel/reserva/${reserva.tipoServicio}/${reserva.id}`;
                      }}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {reserva.codigoReserva}
                        </div>
                        {reserva.hotel && (
                          <div className="text-xs text-gray-500 mt-1">
                            🏨 {reserva.hotel}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reserva.nombreServicio}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {reserva.nombreContacto}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reserva.telefonoContacto}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(reserva.fecha).toLocaleDateString('es-ES')}
                        </div>
                        <div className="text-xs text-gray-500">{reserva.hora}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {reserva.numeroPasajeros}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {new Intl.NumberFormat('es-CO').format(
                            reserva.precioFinal
                          )}{' '}
                          COP
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                            reserva.estado
                          )}`}
                        >
                          {getEstadoIcon(reserva.estado)}
                          {getEstadoLabel(reserva.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/panel/reserva/${reserva.tipoServicio}/${reserva.id}`;
                          }}
                          className="inline-flex items-center gap-1 text-black hover:text-gray-700 font-semibold cursor-pointer"
                        >
                          Ver detalles
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {filteredReservas.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-600">
              Mostrando{' '}
              <span className="font-semibold text-gray-900">
                {filteredReservas.length}
              </span>{' '}
              {filteredReservas.length === 1 ? 'reserva' : 'reservas'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';

import { Calendar, Clock, User, Search } from 'lucide-react';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

const ReceptionistDailyAppointments = () => {
  // Estados para manejar los datos y la UI
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  // Función para cargar las citas
  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await axiosInstance.get('/receptionist/appointments/daily', {
        params: {
          date: format(selectedDate, 'yyyy-MM-dd'),
          page: 0,
          size: 50
        }
      });

      if (response.data.success) {
        setAppointments(response.data.data.content);
      }
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Error al cargar las citas');
      toast.error('Error al cargar las citas del día');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  // Cargar citas cuando cambia la fecha
  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Filtrar citas basado en el término de búsqueda
  const filteredAppointments = appointments.filter(appointment => {
    const searchString = searchTerm.toLowerCase();
    return (
      appointment.clientName.toLowerCase().includes(searchString) ||
      appointment.petName.toLowerCase().includes(searchString) ||
      appointment.veterinarianName.toLowerCase().includes(searchString)
    );
  });

  // Renderizar el estado de la cita con color apropiado
  const AppointmentStatus = ({ status }) => {
    const statusColors = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status === 'SCHEDULED' && 'Programada'}
        {status === 'CONFIRMED' && 'Confirmada'}
        {status === 'CANCELLED' && 'Cancelada'}
        {status === 'COMPLETED' && 'Completada'}
      </span>
    );
  };
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    setSelectedDate(utcDate);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Encabezado y controles */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Citas del Día</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {/* Selector de fecha */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={handleDateChange}
              className="border-none focus:ring-0"
            />
          </div>

          {/* Barra de búsqueda */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar citas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Estado de carga y errores */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-gray-50 text-gray-500 p-8 rounded-lg text-center">
          No hay citas programadas para este día
        </div>
      ) : (
        /* Tabla de citas */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Veterinario</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-2" />
                        {format(new Date(appointment.appointmentTime), 'HH:mm')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{appointment.petName}</div>
                      <div className="text-sm text-gray-500">{appointment.petSpecies} - {appointment.petBreed}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{appointment.clientName}</div>
                      <div className="text-sm text-gray-500">{appointment.clientPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{appointment.veterinarianName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <AppointmentStatus status={appointment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{appointment.reason}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDailyAppointments;
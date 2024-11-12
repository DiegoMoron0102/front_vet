// components/appointments/DailyAppointmentsTable.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Table from '../common/Table/Table';
import axiosInstance from '../../config/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const DailyAppointmentsTable = ({ selectedDate }) => {
  // Contexto de autenticación
  const { user } = useAuth();

  // Estados
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'appointmentDate',
    sortDirection: 'ASC'
  });
  const [filters, setFilters] = useState({});

  // Función memorizada para obtener las citas
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Formateamos la fecha como objeto Date si es string
      let dateToUse = typeof selectedDate === 'string' 
        ? new Date(selectedDate) 
        : selectedDate;
        
        dateToUse = new Date(dateToUse.getTime() + Math.abs(dateToUse.getTimezoneOffset() * 60000));

      // Construimos los parámetros
      const params = {
        date: dateToUse.toISOString(),
        veterinarianId: user.uid,
        page: pagination.pageNumber,
        size: pagination.pageSize,
        sortBy: sortConfig.sortBy,
        sortDirection: sortConfig.sortDirection,
        ...filters
      };

      // Log para debugear
      console.log('Sending request with params:', params);

      const response = await axiosInstance.get('/appointments/daily', { params });

      // Log para debugear
      console.log('Response received:', response.data);

      if (response.data.data) {
        setAppointments(response.data.data.content || []);
        setPagination(prev => ({
          ...prev,
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 0
        }));
      } else {
        setAppointments([]);
        setPagination(prev => ({
          ...prev,
          totalElements: 0,
          totalPages: 0
        }));
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      console.error('Error details:', {
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });

      if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else {
        toast.error('Error loading appointments: ' + (error.response?.data?.error?.message || error.message));
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, user.uid, pagination.pageNumber, pagination.pageSize, sortConfig.sortBy, sortConfig.sortDirection, filters]);
  useEffect(() => {
    console.log('Selected date changed:', selectedDate);
  }, [selectedDate]);

  

  // Efecto para cargar las citas cuando cambien las dependencias
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Manejadores de eventos memorizados
  const handleDetails = useCallback(async (appointmentId) => {
    try {
      // Aquí iría la lógica para mostrar los detalles (por ejemplo, abrir un modal)
      toast.success('Opening appointment details');
    } catch (error) {
      toast.error('Error showing appointment details');
      console.error('Error showing details:', error);
    }
  }, []);

  const handleReschedule = useCallback(async (appointmentId) => {
    try {
      // Aquí iría la lógica para reprogramar (por ejemplo, abrir un modal de reprogramación)
      toast.success('Opening reschedule form');
    } catch (error) {
      toast.error('Error opening reschedule form');
      console.error('Error rescheduling:', error);
    }
  }, []);

  const handleCancel = useCallback(async (appointmentId) => {
    try {
      if (window.confirm('Are you sure you want to cancel this appointment?')) {
        await axiosInstance.post(`/appointments/${appointmentId}/cancel`);
        toast.success('Appointment cancelled successfully');
        await fetchAppointments();
      }
    } catch (error) {
      toast.error('Error cancelling appointment');
      console.error('Error cancelling:', error);
    }
  }, [fetchAppointments]);

  const handlePageChange = useCallback((newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  }, []);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      sortBy: key,
      sortDirection: prev.sortBy === key && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC'
    }));
  }, []);

  const handleFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
  }, []);

  // Función auxiliar para obtener las clases CSS del estado
  const getStatusColor = useCallback((status) => {
    const colors = {
      SCHEDULED: 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full',
      CONFIRMED: 'text-green-600 bg-green-100 px-2 py-1 rounded-full',
      CANCELLED: 'text-red-600 bg-red-100 px-2 py-1 rounded-full',
      COMPLETED: 'text-blue-600 bg-blue-100 px-2 py-1 rounded-full',
      IN_PROGRESS: 'text-purple-600 bg-purple-100 px-2 py-1 rounded-full'
    };
    return colors[status] || '';
  }, []);

  // Definición de columnas
  const columns = [
    {
        key: 'appointmentDate',
        label: 'Time',
        sortable: true,
        render: (row) => {
          try {
            return format(new Date(row.appointmentDate), 'HH:mm');
          } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid date';
          }
        }
    },
    {
      key: 'client',
      label: 'Client',
      filterable: true,
      render: (row) => `${row.client.nombre} ${row.client.apellido}`
    },
    {
      key: 'pet',
      label: 'Pet',
      filterable: true,
      render: (row) => row.pet.name
    },
    {
      key: 'reason',
      label: 'Reason',
      filterable: true
    },
    {
      key: 'status',
      label: 'Status',
      filterable: true,
      render: (row) => (
        <span className={getStatusColor(row.status)}>
          {row.status}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleDetails(row.id)}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          >
            Details
          </button>
          <button
            onClick={() => handleReschedule(row.id)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Reschedule
          </button>
          <button
            onClick={() => handleCancel(row.id)}
            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      )
    }
  ];
  

  return (
    <>
    {isLoading && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      )}
    <Table
      columns={columns}
      data={appointments}
      pagination={pagination}
      onPageChange={handlePageChange}
      onSort={handleSort}
      onFilter={handleFilter}
      isLoading={isLoading}
    />
    </>
  );
};

export default DailyAppointmentsTable;
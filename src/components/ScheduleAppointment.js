import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Calendar, Clock, User, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../config/axios';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// Esquema de validación con Yup
const validationSchema = Yup.object().shape({
  appointmentDate: Yup.date()
    .required('La fecha es requerida')
    .min(new Date(), 'La fecha no puede ser en el pasado'),
  appointmentTime: Yup.string()
    .required('La hora es requerida'),
  reason: Yup.string()
    .required('El motivo es requerido')
    .min(5, 'El motivo debe tener al menos 5 caracteres'),
  notes: Yup.string()
    .min(5, 'Las notas deben tener al menos 5 caracteres'),
  veterinarianId: Yup.string()
    .required('El veterinario es requerido'),
});

const ScheduleAppointment = ({ petId, clientId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [veterinarians, setVeterinarians] = useState([]);
  const [error, setError] = useState(null);

  // Cargar lista de veterinarios disponibles
  useEffect(() => {
    const loadVeterinarians = async () => {
      try {
        const response = await axiosInstance.get('/users', {
          params: {
            role: 'VETERINARIO',
            isActive: true
          }
        });
        if (response.data.success) {
          setVeterinarians(response.data.data.content);
        }
      } catch (err) {
        console.error('Error loading veterinarians:', err);
        setError('No se pudieron cargar los veterinarios disponibles');
      }
    };

    if (user?.roles?.[0] !== 'VETERINARIO') {
      loadVeterinarians();
    }
  }, [user]);

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      appointmentDate: format(new Date(), 'yyyy-MM-dd'),
      appointmentTime: '09:00',
      reason: '',
      notes: '',
      veterinarianId: user?.roles?.[0] === 'VETERINARIO' ? user.uid : '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Combinar fecha y hora en un solo campo ISO
        const appointmentDateTime = new Date(`${values.appointmentDate}T${values.appointmentTime}`);

        const appointmentData = {
          petId,
          clientId,
          veterinarianId: values.veterinarianId,
          appointmentDate: appointmentDateTime.toISOString(),
          reason: values.reason,
          notes: values.notes || '',
        };

        // Agregar el token de autorización explícitamente
        const token = localStorage.getItem('token');
        const response = await axiosInstance.post('/appointments/schedule', appointmentData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          toast.success('Cita agendada exitosamente');
          onSuccess && onSuccess(response.data.data);
        }
      } catch (error) {
        console.error('Error scheduling appointment:', error);
        const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.message ||
                           'Error al agendar la cita';
                           
        setError(errorMessage);
        toast.error(errorMessage);
        
        // Si es un error de autorización, mostrar mensaje específico
        if (error.response?.status === 403) {
          setError('No tienes permiso para agendar citas para esta mascota');
          toast.error('No tienes permiso para agendar citas para esta mascota');
        }
        
        // Si es un error de validación
        if (error.response?.status === 400) {
          setError('Por favor verifica los datos ingresados');
          toast.error('Por favor verifica los datos ingresados');
        }
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Si hay un error general, mostrarlo
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
        <button
          onClick={onCancel}
          className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Agendar Nueva Cita</h2>
      
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Fecha y Hora */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                name="appointmentDate"
                {...formik.getFieldProps('appointmentDate')}
                min={format(new Date(), 'yyyy-MM-dd')}
                className={`pl-10 w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500
                  ${formik.touched.appointmentDate && formik.errors.appointmentDate ? 'border-red-300' : 'border-gray-300'}`}
              />
            </div>
            {formik.touched.appointmentDate && formik.errors.appointmentDate && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.appointmentDate}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="time"
                name="appointmentTime"
                {...formik.getFieldProps('appointmentTime')}
                min="09:00"
                max="18:00"
                step="1800"
                className={`pl-10 w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500
                  ${formik.touched.appointmentTime && formik.errors.appointmentTime ? 'border-red-300' : 'border-gray-300'}`}
              />
            </div>
            {formik.touched.appointmentTime && formik.errors.appointmentTime && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.appointmentTime}</p>
            )}
          </div>
        </div>

        {/* Veterinario - Solo si el usuario actual no es veterinario */}
        {user?.roles?.[0] !== 'VETERINARIO' && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Veterinario
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                name="veterinarianId"
                {...formik.getFieldProps('veterinarianId')}
                className={`pl-10 w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500
                  ${formik.touched.veterinarianId && formik.errors.veterinarianId ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">Seleccionar veterinario</option>
                {veterinarians.map(vet => (
                  <option key={vet.uid} value={vet.uid}>
                    Dr. {vet.nombre} {vet.apellido}
                  </option>
                ))}
              </select>
            </div>
            {formik.touched.veterinarianId && formik.errors.veterinarianId && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.veterinarianId}</p>
            )}
          </div>
        )}

        {/* Motivo */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de la consulta
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              name="reason"
              {...formik.getFieldProps('reason')}
              rows="3"
              className={`pl-10 w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500
                ${formik.touched.reason && formik.errors.reason ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Describa el motivo de la consulta"
            />
          </div>
          {formik.touched.reason && formik.errors.reason && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.reason}</p>
          )}
        </div>

        {/* Notas adicionales */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas adicionales (opcional)
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              name="notes"
              {...formik.getFieldProps('notes')}
              rows="3"
              className={`pl-10 w-full px-4 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500
                ${formik.touched.notes && formik.errors.notes ? 'border-red-300' : 'border-gray-300'}`}
              placeholder="Información adicional relevante"
            />
          </div>
          {formik.touched.notes && formik.errors.notes && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.notes}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading || !formik.isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
          >
            {isLoading ? 'Agendando...' : 'Agendar Cita'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleAppointment;
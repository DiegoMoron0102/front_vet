import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

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
    .required('El veterinario es requerido')
});

const ScheduleAppointment = ({ petId, clientId, onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [veterinarians, setVeterinarians] = useState([]);
  const [error, setError] = useState(null);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(null);

  const isVeterinarian = user?.roles?.[0] === 'VETERINARIO';

  useEffect(() => {
    if (isVeterinarian) {
      setSelectedVeterinarian({
        uid: user.uid,
        nombre: user.nombre,
        apellido: user.apellido
      });
    } else {
      const loadVeterinarians = async () => {
        try {
          const response = await axiosInstance.get('/users/veterinarians', {
            params: {
              page: 0,
              size: 10,
              sortBy: 'nombre',
              sortDirection: 'ASC'
            }
          });

          if (response.data.success) {
            setVeterinarians(response.data.data.content);
          } else {
            toast.error('No se pudieron cargar los veterinarios');
          }
        } catch (error) {
          console.error('Error loading veterinarians:', error);
          toast.error(error.response?.data?.error?.message || 'Error al cargar la lista de veterinarios');
          setError('No se pudieron cargar los veterinarios disponibles');
        }
      };

      loadVeterinarians();
    }
  }, [user, isVeterinarian]);

  const formik = useFormik({
    initialValues: {
      appointmentDate: format(new Date(), 'yyyy-MM-dd'),
      appointmentTime: '09:00',
      reason: '',
      notes: '',
      veterinarianId: selectedVeterinarian?.uid || ''
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setIsLoading(true);
      setError(null);
      
      try {
        const appointmentDateTime = new Date(`${values.appointmentDate}T${values.appointmentTime}`);

        const appointmentData = {
          petId,
          clientId,
          veterinarianId: isVeterinarian ? user.uid : values.veterinarianId,
          appointmentDate: appointmentDateTime.toISOString(),
          reason: values.reason,
          notes: values.notes || ''
        };

        const response = await axiosInstance.post('/appointments/schedule', appointmentData);

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
      } finally {
        setIsLoading(false);
      }
    },
  });

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
      {isVeterinarian || selectedVeterinarian ? (
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                {...formik.getFieldProps('appointmentDate')}
                min={format(new Date(), 'yyyy-MM-dd')}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              {formik.touched.appointmentDate && formik.errors.appointmentDate && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.appointmentDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora
              </label>
              <input
                type="time"
                {...formik.getFieldProps('appointmentTime')}
                min="09:00"
                max="18:00"
                step="1800"
                className="w-full px-3 py-2 border rounded-md"
                required
              />
              {formik.touched.appointmentTime && formik.errors.appointmentTime && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.appointmentTime}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la consulta
            </label>
            <textarea
              {...formik.getFieldProps('reason')}
              rows="3"
              className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Describa el motivo de la consulta"
              required
            />
            {formik.touched.reason && formik.errors.reason && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.reason}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas adicionales (opcional)
            </label>
            <textarea
              {...formik.getFieldProps('notes')}
              rows="3"
              className="w-full px-3 py-2 border rounded-md focus:ring-purple-500 focus:border-purple-500"
              placeholder="Información adicional relevante"
            />
            {formik.touched.notes && formik.errors.notes && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.notes}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            {!isVeterinarian && (
              <button
                type="button"
                onClick={() => setSelectedVeterinarian(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cambiar veterinario
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !formik.isValid}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? 'Agendando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Seleccione un veterinario</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {veterinarians.map((vet) => (
                  <tr key={vet.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vet.nombre} {vet.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vet.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedVeterinarian(vet);
                          formik.setFieldValue('veterinarianId', vet.uid);
                        }}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md"
                      >
                        Seleccionar
                      </button>
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

export default ScheduleAppointment;
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

// Esquema de validación para el formulario
const validationSchema = Yup.object({
  motivoConsulta: Yup.string()
    .required('El motivo de consulta es requerido')
    .min(5, 'El motivo debe tener al menos 5 caracteres'),
  diagnostico: Yup.string()
    .required('El diagnóstico es requerido')
    .min(5, 'El diagnóstico debe tener al menos 5 caracteres'),
  tratamiento: Yup.string()
    .required('El tratamiento es requerido')
    .min(5, 'El tratamiento debe tener al menos 5 caracteres'),
  observaciones: Yup.string()
    .min(5, 'Las observaciones deben tener al menos 5 caracteres')
});

const AddMedicalRecord = ({ petId, petName, onClose, onSuccess }) => {
  // Estado para manejar la carga
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      motivoConsulta: '',
      diagnostico: '',
      tratamiento: '',
      observaciones: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Realizar la petición al backend
        const response = await axiosInstance.post(
          `/historial-clinico/mascota/${petId}`,
          values
        );

        if (response.data.success) {
          toast.success('Registro médico agregado exitosamente');
          // Llamar al callback de éxito si existe
          if (onSuccess) {
            onSuccess(response.data.data);
          }
          onClose();
        }
      } catch (error) {
        console.error('Error adding medical record:', error);
        toast.error(
          error.response?.data?.error?.message || 
          'Error al agregar el registro médico'
        );
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Agregar Registro Médico
          </h2>
          <p className="text-sm text-gray-600">
            Mascota: {petName}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        {/* Motivo de Consulta */}
        <div>
          <label 
            htmlFor="motivoConsulta" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Motivo de Consulta
          </label>
          <textarea
            id="motivoConsulta"
            name="motivoConsulta"
            rows="3"
            {...formik.getFieldProps('motivoConsulta')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm
              ${formik.touched.motivoConsulta && formik.errors.motivoConsulta 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
          />
          {formik.touched.motivoConsulta && formik.errors.motivoConsulta && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.motivoConsulta}
            </p>
          )}
        </div>

        {/* Diagnóstico */}
        <div>
          <label 
            htmlFor="diagnostico" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Diagnóstico
          </label>
          <textarea
            id="diagnostico"
            name="diagnostico"
            rows="3"
            {...formik.getFieldProps('diagnostico')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm
              ${formik.touched.diagnostico && formik.errors.diagnostico 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
          />
          {formik.touched.diagnostico && formik.errors.diagnostico && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.diagnostico}
            </p>
          )}
        </div>

        {/* Tratamiento */}
        <div>
          <label 
            htmlFor="tratamiento" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tratamiento
          </label>
          <textarea
            id="tratamiento"
            name="tratamiento"
            rows="3"
            {...formik.getFieldProps('tratamiento')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm
              ${formik.touched.tratamiento && formik.errors.tratamiento 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
          />
          {formik.touched.tratamiento && formik.errors.tratamiento && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.tratamiento}
            </p>
          )}
        </div>

        {/* Observaciones */}
        <div>
          <label 
            htmlFor="observaciones" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Observaciones
          </label>
          <textarea
            id="observaciones"
            name="observaciones"
            rows="3"
            {...formik.getFieldProps('observaciones')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm
              ${formik.touched.observaciones && formik.errors.observaciones 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-purple-500 focus:border-purple-500'
              }`}
          />
          {formik.touched.observaciones && formik.errors.observaciones && (
            <p className="mt-1 text-sm text-red-600">
              {formik.errors.observaciones}
            </p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white 
                     border border-gray-300 rounded-md hover:bg-gray-50 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 
                     focus:ring-purple-500"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !formik.isValid}
            className={`px-4 py-2 text-sm font-medium text-white 
                     bg-purple-600 border border-transparent rounded-md 
                     hover:bg-purple-700 focus:outline-none focus:ring-2 
                     focus:ring-offset-2 focus:ring-purple-500
                     disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMedicalRecord;
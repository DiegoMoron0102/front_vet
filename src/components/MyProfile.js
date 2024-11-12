import React, { useState, useEffect, useCallback } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { User } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../config/axios';

const MyProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Esquema de validación
  const validationSchema = Yup.object({
    nombre: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    apellido: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    telefono: Yup.string()
      .required('Phone number is required')
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    direccion: Yup.string()
      .required('Address is required')
      .min(5, 'Address must be at least 5 characters')
  });

  // Configurar Formik
  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      telefono: '',
      direccion: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axiosInstance.put('/users/me', {
          nombre: values.nombre,
          apellido: values.apellido,
          telefono: values.telefono,
          direccion: values.direccion
        });

        if (response.data.success) {
          // Actualizar el estado local con los datos de respuesta
          setUser(response.data.data);
          toast.success('Profile updated successfully');
        }
      } catch (error) {
        console.error('Update error:', error);
        toast.error(error.response?.data?.error?.message || 'Error updating profile');
      }
    }
  });

  // Cargar datos del usuario
  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/users/me');

      if (response.data.success) {
        const userData = response.data.data;
        setUser(userData);
        formik.setValues({
          nombre: userData.nombre || '',
          apellido: userData.apellido || '',
          telefono: userData.telefono || '',
          direccion: userData.direccion || ''
        });
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error(error.response?.data?.error?.message || 'Error loading profile');
    } finally {
      setIsLoading(false);
    }
  }, [formik]); // formik como dependencia de useCallback

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-purple-100 p-3 rounded-full">
          <User className="h-8 w-8 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg p-8">
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="nombre"
                {...formik.getFieldProps('nombre')}
                className={`
                  w-full px-4 py-3 rounded-md
                  border border-gray-300 
                  focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                  ${formik.touched.nombre && formik.errors.nombre ? 'border-red-300' : ''}
                `}
              />
              {formik.touched.nombre && formik.errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.nombre}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="apellido"
                {...formik.getFieldProps('apellido')}
                className={`
                  w-full px-4 py-3 rounded-md
                  border border-gray-300 
                  focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                  ${formik.touched.apellido && formik.errors.apellido ? 'border-red-300' : ''}
                `}
              />
              {formik.touched.apellido && formik.errors.apellido && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.apellido}</p>
              )}
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              name="telefono"
              {...formik.getFieldProps('telefono')}
              className={`
                w-full px-4 py-3 rounded-md
                border border-gray-300 
                focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                ${formik.touched.telefono && formik.errors.telefono ? 'border-red-300' : ''}
              `}
            />
            {formik.touched.telefono && formik.errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.telefono}</p>
            )}
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              name="direccion"
              {...formik.getFieldProps('direccion')}
              className={`
                w-full px-4 py-3 rounded-md
                border border-gray-300 
                focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                ${formik.touched.direccion && formik.errors.direccion ? 'border-red-300' : ''}
              `}
            />
            {formik.touched.direccion && formik.errors.direccion && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.direccion}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.dirty || !formik.isValid}
              className={`
                px-6 py-3 rounded-md text-white
                ${formik.isSubmitting || !formik.dirty || !formik.isValid
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'}
                transition-colors duration-200 
                focus:outline-none focus:ring-2 focus:ring-purple-500
              `}
            >
              {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Role Badge */}
      <div className="mt-6 flex justify-end">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
          {user?.roles[0]}
        </span>
      </div>
    </div>
  );
};

export default MyProfile;
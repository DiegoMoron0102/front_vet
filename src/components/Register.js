// src/components/Register.js
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Por favor ingresa un email válido')
        .required('El email es requerido'),
      firstName: Yup.string()
        .required('El nombre es requerido')
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
      lastName: Yup.string()
        .required('El apellido es requerido')
        .min(2, 'El apellido debe tener al menos 2 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo se permiten letras'),
      phoneNumber: Yup.string()
        .required('El teléfono es requerido')
        .matches(/^\d{8}$/, 'El teléfono debe tener exactamente 10 dígitos'),
      password: Yup.string()
        .required('La contraseña es requerida')
        .min(6, 'La contraseña debe tener al menos 6 caracteres'),
      confirmPassword: Yup.string()
        .required('Por favor confirma tu contraseña')
        .oneOf([Yup.ref('password'), null], 'Las contraseñas deben coincidir'),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const userData = {
          email: values.email,
          nombre: values.firstName,
          apellido: values.lastName,
          telefono: values.phoneNumber,
          password: values.password,
          roles: ['CLIENTE'],
        };
        const response = await axios.post('http://localhost:8080/api/auth/register', userData);
        if (response.data.success) {
          // Extraer token y datos del usuario
          const { token, user } = response.data.data;
          
          // Actualizar contexto de autenticación
          login(user, token);
          
          toast.success('¡Registro exitoso!');
          navigate('/dashboard');
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error?.message || 'Error al registrar usuario';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen">
      {/* Imagen decorativa - lado izquierdo */}
      <div className="hidden lg:flex lg:w-1/2">
        <img 
          src="/register-pets.png" 
          alt="Pets illustration"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Formulario - lado derecho */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <h2 className="flex items-center justify-center text-3xl font-bold">
              <span className="text-4xl mr-2">🐾</span>
              PurplePaw
            </h2>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="email"
                {...formik.getFieldProps('email')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your email"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            {/* Campos Nombre y Apellido */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  {...formik.getFieldProps('firstName')}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your first name"
                />
                {formik.touched.firstName && formik.errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  {...formik.getFieldProps('lastName')}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter your last name"
                />
                {formik.touched.lastName && formik.errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Campo Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                {...formik.getFieldProps('phoneNumber')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your phone number"
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.phoneNumber}</p>
              )}
            </div>

            {/* Campos Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                {...formik.getFieldProps('password')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                {...formik.getFieldProps('confirmPassword')}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                placeholder="Confirm your password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;

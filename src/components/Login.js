// src/components/Login.js
import React, { useState } from 'react'; // Añadido useState
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService'; // Importación correcta
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Esquema de validación con Yup
  const validationSchema = Yup.object({
    email: Yup.string()
      .email('Correo electrónico inválido')
      .required('El correo electrónico es requerido'),
    password: Yup.string()
      .required('La contraseña es requerida')
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      setLoginError(''); // Limpiar error anterior
      
      try {
        const response = await authService.login(values);
        login(response.user, response.token);
        toast.success('¡Inicio de sesión exitoso!');
        navigate('/dashboard');
      } catch (error) {
        let errorMessage = 'Ha ocurrido un error al iniciar sesión';
        
        // Manejar errores específicos
        switch (error.code) {
          case 'AUTH_ERROR':
            errorMessage = 'Correo electrónico o contraseña incorrectos';
            break;
          case 'NETWORK_ERROR':
            errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
            break;
          default:
            errorMessage = error.message || 'Ha ocurrido un error inesperado';
        }
        
        setLoginError(errorMessage);
        toast.error(errorMessage, {
          duration: 4000,
          position: 'top-right',
          style: {
            background: '#363636',
            color: '#fff',
          },
        });
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        {/* Logo */}
        <div className="flex justify-center">
          <img src="/logo.png" alt="PurplePaw" className="h-20 w-auto" />
        </div>

        {/* Título */}
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Iniciar Sesión
        </h2>

        {/* Formulario */}
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            {/* Campo de Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  {...formik.getFieldProps('email')}
                  className={`appearance-none block w-full px-3 py-2 border 
                    ${formik.touched.email && formik.errors.email 
                      ? 'border-red-300' 
                      : 'border-gray-300'} 
                    rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                />
                {formik.touched.email && formik.errors.email && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.email}</p>
                )}
              </div>
            </div>

            {/* Campo de Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  {...formik.getFieldProps('password')}
                  className={`appearance-none block w-full px-3 py-2 border 
                    ${formik.touched.password && formik.errors.password 
                      ? 'border-red-300' 
                      : 'border-gray-300'} 
                    rounded-md shadow-sm placeholder-gray-400 
                    focus:outline-none focus:ring-purple-500 focus:border-purple-500`}
                />
                {formik.touched.password && formik.errors.password && (
                  <p className="mt-2 text-sm text-red-600">{formik.errors.password}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md
              shadow-sm text-sm font-medium text-white bg-[#C792DF] 
              hover:bg-[#b36ed3] focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-[#C792DF] transition-colors
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          {/* Link a Registro */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-[#C792DF] hover:text-[#b36ed3]">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
        {loginError && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center" role="alert">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {loginError}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
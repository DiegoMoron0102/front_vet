// src/config/axios.js

import axios from 'axios';
import { toast } from 'react-hot-toast';


const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080/api',
  timeout: 25000,
});
// Variable para almacenar la función de logout que se inyectará desde AuthContext
let logoutHandler = null;

// Función para establecer el manejador de logout
export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Interceptor para agregar el token a todas las solicitudes
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Manejar error de token expirado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Si tenemos un manejador de logout, lo ejecutamos
      if (logoutHandler) {
        logoutHandler();
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      }

      // Limpiar el almacenamiento local
      localStorage.clear();
    }

    // Manejar otros errores de respuesta
    if (error.response?.status === 403) {
      toast.error('No tienes permiso para realizar esta acción');
    }

    if (error.response?.status === 500) {
      toast.error('Error del servidor. Por favor, intenta más tarde');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
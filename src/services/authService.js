// src/services/authService.js

// Importamos axios para realizar peticiones HTTP
import axios from 'axios';

// URL base de nuestra API backend
const API_URL = 'http://localhost:8080/api';

/**
 * Configuración de la instancia de axios
 * Esto nos permite tener una configuración centralizada para todas las peticiones
 */
const axiosInstance = axios.create({
  baseURL: API_URL, // URL base que se utilizará para todas las peticiones
  headers: {
    'Content-Type': 'application/json', // Indicamos que enviaremos JSON en las peticiones
  },
  timeout: 5000, // Timeout de 5 segundos para las peticiones
});

/**
 * Interceptor para peticiones
 * Se ejecuta antes de cada petición
 * Aquí agregamos el token de autenticación si existe
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // Obtener el token del localStorage
    const token = localStorage.getItem('token');
    
    // Si existe un token, lo agregamos al header de la petición
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Si hay un error en la petición, lo rechazamos
    return Promise.reject(error);
  }
);

/**
 * Interceptor para respuestas
 * Se ejecuta después de cada respuesta del servidor
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Verificar si la respuesta indica error
    if (!response.data.success) {
      // Crear un error con la estructura de la respuesta
      const error = new Error(response.data.error.message);
      error.code = response.data.error.code;
      throw error;
    }
    return response;
  },
  (error) => {
    // Si hay un error de respuesta del servidor
    if (error.response?.data) {
      // Usar la estructura de error del backend si está disponible
      const serverError = new Error(
        error.response.data.error?.message || 'Ha ocurrido un error en el servidor'
      );
      serverError.code = error.response.data.error?.code || 'SERVER_ERROR';
      throw serverError;
    }
    
    // Error de red o servidor no disponible
    if (error.request) {
      const networkError = new Error('No se pudo conectar con el servidor. Por favor, verifica tu conexión.');
      networkError.code = 'NETWORK_ERROR';
      throw networkError;
    }
    
    // Otros errores
    const genericError = new Error('Ha ocurrido un error inesperado');
    genericError.code = 'UNKNOWN_ERROR';
    throw genericError;
  }
);

/**
 * Servicio de autenticación
 * Contiene todos los métodos relacionados con la autenticación
 */
const authService = {
  async login(credentials) {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      
      // Ya no necesitamos verificar success aquí porque el interceptor lo maneja
      const { token, user } = response.data.data;
      
      // Guardar token y datos del usuario
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return { token, user };
    } catch (error) {
      // Propagar el error para que sea manejado por el componente
      throw error;
    }
    
  },

  /**
   * Método para registrar un nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @returns {Promise} Promesa con la respuesta del servidor
   */
  async register(userData) {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      
      // Si el registro es exitoso y devuelve un token, lo guardamos
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  },

  /**
   * Método para cerrar sesión
   */
  logout() {
    localStorage.removeItem('token');
  },
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return this.getToken() !== null;
  },

  /**
   * Método privado para manejar errores
   * @param {Error} error - Error a manejar
   * @returns {Object} Objeto de error formateado
   */
  handleError(error) {
    if (error.response) {
      // Personalizamos el mensaje de error según el tipo
      const errorMessage = error.response.data?.message || 'Error en la operación';
      return {
        message: errorMessage,
        status: error.response.status,
        data: error.response.data
      };
    }
    
    return {
      message: 'Error de conexión con el servidor',
      status: 500,
      data: null
    };
  }
};

export default authService;
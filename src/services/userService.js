// src/services/userService.js
import axiosInstance from '../config/axios';

const userService = {
  // Obtener usuarios con paginación y filtros
  async getUsers(paginationRequest) {
    try {
      // Construir parámetros de la petición
      const params = {
        page: paginationRequest.page || 0,
        size: paginationRequest.size || 10,
        sortBy: paginationRequest.sortBy || 'nombre',
        sortDirection: paginationRequest.sortDirection || 'ASC'
      };

      // Añadir filtros adicionales si existen
      if (paginationRequest.role && paginationRequest.role !== 'ALL') {
        params.role = paginationRequest.role;
      }

      if (paginationRequest.isActive !== undefined) {
        params.isActive = paginationRequest.isActive;
      }

      if (paginationRequest.search) {
        params.filterBy = 'nombre';
        params.filterValue = paginationRequest.search;
      }

      const response = await axiosInstance.get('/users', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error in getUsers:', error);
      throw error;
    }
  },

  // Crear nuevo usuario
  async createUser(userData) {
    try {
      const response = await axiosInstance.post('/users', userData);
      return response.data.data;
    } catch (error) {
      console.error('Error in createUser:', error);
      throw error;
    }
  },

  // Actualizar usuario existente
  async updateUser(userId, userData) {
    try {
      const response = await axiosInstance.put(`/users/${userId}`, userData);
      return response.data.data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      throw error;
    }
  },

  // Eliminar usuario
  async deleteUser(userId) {
    try {
      const response = await axiosInstance.delete(`/users/${userId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      throw error;
    }
  },

  // Cambiar estado del usuario (activar/desactivar)
  async toggleUserStatus(userId, isActive) {
    try {
      const response = await axiosInstance.post(`/users/${userId}/toggle-status`, {
        isActive: isActive
      });
      return response.data.data;
    } catch (error) {
      console.error('Error in toggleUserStatus:', error);
      throw error;
    }
  }
};

export default userService;
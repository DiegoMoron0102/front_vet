// src/services/clientService.js

import axiosInstance from '../config/axios';
import searchService from './searchService'

// src/services/clientService.js

const clientService = {
  async getClients(paginationRequest) {
    try {
      // Si hay término de búsqueda, usar el endpoint de búsqueda
      if (paginationRequest.search) {
        return searchService.searchClients(paginationRequest.search, paginationRequest);
      }

      const params = {
        page: paginationRequest.page || 0,
        size: paginationRequest.size || 10,
        sortBy: paginationRequest.sortBy || 'nombre',
        sortDirection: paginationRequest.sortDirection || 'ASC',
        role: 'CLIENTE',
        isActive: true
      };

      const response = await axiosInstance.get('/users', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }
};

export default clientService;
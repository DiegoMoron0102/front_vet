// src/services/clientService.js

import axiosInstance from '../config/axios';

// src/services/clientService.js

const clientService = {
  async getClients(paginationRequest) {
    try {
      // Construir parámetros exactamente como los espera el backend
      const params = {
        page: paginationRequest.page || 0,
        size: paginationRequest.size || 10,
        sortBy: paginationRequest.sortBy || 'nombre',
        sortDirection: paginationRequest.sortDirection || 'ASC',
        role: 'CLIENTE',
        isActive: true
      };

      // Si hay término de búsqueda, usar filterBy y filterValue
      if (paginationRequest.search) {
        params.filterBy = 'nombre';
        params.filterValue = paginationRequest.search;
      }

      console.log('Request params:', params);

      const response = await axiosInstance.get('/users', { params });
      console.log('Response:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  }
};

export default clientService;
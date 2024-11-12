// src/services/searchService.js
import axiosInstance from '../config/axios';

const searchService = {
  async searchClients(searchTerm, paginationRequest) {
    try {
      const params = {
        searchTerm,
        page: paginationRequest.page || 0,
        size: paginationRequest.size || 10,
        sortBy: paginationRequest.sortBy || 'nombre',
        sortDirection: paginationRequest.sortDirection || 'ASC'
      };

      const response = await axiosInstance.get('/users/search', { params });
      return response.data.data;
    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }
};

export default searchService;
import axios from 'axios';

// URL base del API
const API_BASE_URL = 'http://localhost:8080/api/veterinary';

// Función para obtener el token almacenado (puedes modificarla según cómo gestionas el token)
const getAuthToken = () => {
  return localStorage.getItem('token'); // Suponiendo que el token se guarda en localStorage
};

const petService = {
    getPetsByClientId: async (clientId) => {
        try {
          const token = getAuthToken();
          const response = await axios.get(`${API_BASE_URL}/clients/${clientId}/pets`, {
            headers: {
              Authorization: `Bearer ${token}` // Incluimos el token en los headers
            }
          });
    
          // Verificar que la respuesta tenga éxito y la estructura sea correcta
          if (response.data.success && response.data.data && Array.isArray(response.data.data.mascotas)) {
            return { success: true, mascotas: response.data.data.mascotas };
          } else {
            return { success: false, error: { message: 'No pets found' } };
          }
        } catch (error) {
          console.error('Error in getPetsByClientId:', error);
          return { success: false, error: { message: 'Error fetching pets' } };
        }
      },

  addHistoryToPet: async (petId, historyData) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/pets/${petId}/history`, historyData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: { message: 'Error adding history' } };
      }
    } catch (error) {
      console.error('Error in addHistoryToPet:', error);
      return { success: false, error: { message: 'Error adding history' } };
    }
  },

  getHistoryByPetId: async (petId) => {
    try {
      const token = getAuthToken();
      const response = await axios.get(`${API_BASE_URL}/pets/${petId}/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: { message: 'Error fetching history' } };
      }
    } catch (error) {
      console.error('Error in getHistoryByPetId:', error);
      return { success: false, error: { message: 'Error fetching history' } };
    }
  },

  scheduleAppointment: async (petId, appointmentData) => {
    try {
      const token = getAuthToken();
      const response = await axios.post(`${API_BASE_URL}/pets/${petId}/appointments`, appointmentData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 201) {
        return { success: true, data: response.data };
      } else {
        return { success: false, error: { message: 'Error scheduling appointment' } };
      }
    } catch (error) {
      console.error('Error in scheduleAppointment:', error);
      return { success: false, error: { message: 'Error scheduling appointment' } };
    }
  }
};

export default petService;
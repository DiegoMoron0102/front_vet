import axiosInstance from '../config/axios';

// Obtiene el historial de pagos
export const fetchPaymentHistory = async (params) => {
  const response = await axiosInstance.get('/payment-history', { params });
  return response;
};

// Obtiene el resumen de pagos
export const fetchPaymentSummary = async (startDate, endDate) => {
  const response = await axiosInstance.get('/payment-history/summary', {
    params: { fechaInicio: startDate, fechaFin: endDate },
  });
  return response;
};

// Obtiene los detalles de un pago específico
export const fetchPaymentDetails = async (paymentId) => {
  const response = await axiosInstance.get(`/payment-history/${paymentId}`);
  return response;
};

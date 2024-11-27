import React, { useState, useEffect } from 'react';
import { fetchPaymentHistory, fetchPaymentSummary } from '../api/paymentHistoryApi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import { useCallback } from 'react';


const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    petId: '',
    page: 0,
    size: 10,
    sortBy: 'fechaVisita',
    sortDirection: 'DESC',
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetchPaymentHistory(filters);
      setPayments(response.data.data.content || []);
      toast.success('Pagos cargados con éxito');
    } catch (error) {
      toast.error('Error al cargar pagos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  const loadSummary = useCallback(async () => {
    if (filters.startDate && filters.endDate) {
      try {
        const response = await fetchPaymentSummary(
          filters.startDate.toISOString().split('T')[0],
          filters.endDate.toISOString().split('T')[0]
        );
        setSummary(response.data.data);
      } catch (error) {
        console.error(error);
      }
    }
  }, [filters]);

  useEffect(() => {
    loadPayments();
    loadSummary();
  }, [loadPayments, loadSummary]);
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial de Pagos</h1>

      {/* Filtros */}
      <div className="flex space-x-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Inicio</label>
          <DatePicker
            selected={filters.startDate}
            onChange={(date) => setFilters({ ...filters, startDate: date })}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fin</label>
          <DatePicker
            selected={filters.endDate}
            onChange={(date) => setFilters({ ...filters, endDate: date })}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Ordenar por</label>
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="fechaVisita">Fecha</option>
            <option value="montoTotal">Monto</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">Dirección</label>
          <select
            value={filters.sortDirection}
            onChange={(e) => setFilters({ ...filters, sortDirection: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="DESC">Descendente</option>
            <option value="ASC">Ascendente</option>
          </select>
        </div>
        <button
          onClick={loadPayments}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {/* Tabla */}
      {isLoading ? (
        <div className="text-center">Cargando...</div>
      ) : (
        <div>
          <table className="min-w-full border border-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Servicio</th>
                <th className="px-4 py-2">Mascota</th>
                <th className="px-4 py-2">Monto</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t">
                  <td className="px-4 py-2">{payment.fechaVisita}</td>
                  <td className="px-4 py-2">{payment.serviceName}</td>
                  <td className="px-4 py-2">{payment.petName}</td>
                  <td className="px-4 py-2">${payment.montoTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Resumen */}
          {summary && (
            <div className="p-4 bg-gray-50 rounded shadow">
              <h3 className="text-lg font-medium">Resumen de Pagos</h3>
              <p>Total Pagado: ${summary.totalMonto}</p>
              <p>Total Servicios: {summary.totalServicios}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;

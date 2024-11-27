import React, { useState, useEffect, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import toast from 'react-hot-toast';
import axios from '../config/axios';

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    petId: '',
    montoMinimo: '',
    montoMaximo: '',
    page: 0,
    size: 10,
    sortBy: 'fechaVisita',
    sortDirection: 'DESC',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Función para cargar historial de pagos
  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: filters.page,
        size: filters.size,
        sortBy: filters.sortBy,
        sortDirection: filters.sortDirection,
        ...(filters.startDate && { fechaInicio: filters.startDate.toISOString().split('T')[0] }),
        ...(filters.endDate && { fechaFin: filters.endDate.toISOString().split('T')[0] }),
        ...(filters.petId && { petId: filters.petId }),
        ...(filters.montoMinimo && { montoMinimo: filters.montoMinimo }),
        ...(filters.montoMaximo && { montoMaximo: filters.montoMaximo }),
      };

      const response = await axios.get('/payment-history', { params });
      const paymentsData = response.data.data.content || [];

      const formattedPayments = paymentsData.map((payment) => {
        const servicios = payment.serviciosRealizados.map((servicio) => ({
          serviceName: servicio.nombre,
          servicePrice: servicio.precioBase || 0,
          customPrice: servicio.precioPersonalizado || null,
          notes: servicio.notas || '',
        }));

        const adicionales = payment.serviciosAdicionales.map((adicional) => ({
          serviceName: adicional.descripcion,
          servicePrice: adicional.precio || 0,
          notes: adicional.notas || '',
        }));

        return {
          id: payment.id,
          fecha: new Date(payment.fecha).toLocaleString(),
          petName: payment.petName,
          montoTotal: payment.montoTotal,
          servicios: [...servicios, ...adicionales],
          razon: payment.razon,
          veterinarioNombre: payment.veterinarioNombre,
        };
      });

      setPayments(formattedPayments);
      toast.success('Pagos cargados con éxito');
    } catch (error) {
      toast.error('Error al cargar el historial de pagos');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Función para cargar resumen de pagos
  const loadSummary = useCallback(async () => {
    if (filters.startDate && filters.endDate) {
      try {
        const params = {
          fechaInicio: filters.startDate.toISOString().split('T')[0],
          fechaFin: filters.endDate.toISOString().split('T')[0],
        };
  
        const response = await axios.get('/payment-history/summary', { params });
  
        // Actualizamos el estado del resumen con los datos recibidos
        setSummary(response.data.data || { totalMonto: 0, totalServicios: 0 });
      } catch (error) {
        toast.error('Error al cargar el resumen de pagos');
        console.error('Error al cargar el resumen:', error);
      }
    } else {
      // Si no hay fechas, dejamos el resumen vacío
      setSummary(null);
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
      <div className="flex flex-wrap gap-4 mb-6">
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
          <label className="block text-sm font-medium">Mascota</label>
          <input
            type="text"
            value={filters.petId}
            onChange={(e) => setFilters({ ...filters, petId: e.target.value })}
            placeholder="ID de mascota"
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Monto Mínimo</label>
          <input
            type="number"
            value={filters.montoMinimo}
            onChange={(e) => setFilters({ ...filters, montoMinimo: e.target.value })}
            placeholder="0.00"
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Monto Máximo</label>
          <input
            type="number"
            value={filters.montoMaximo}
            onChange={(e) => setFilters({ ...filters, montoMaximo: e.target.value })}
            placeholder="0.00"
            className="border rounded px-3 py-2"
          />
        </div>
        <button
          onClick={loadPayments}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {/* Tabla de Pagos */}
      {isLoading ? (
        <div className="text-center">Cargando...</div>
      ) : payments.length > 0 ? (
        <table className="min-w-full border border-gray-200 mb-4">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Servicios</th>
              <th className="px-4 py-2">Mascota</th>
              <th className="px-4 py-2">Monto</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-t">
                <td className="px-4 py-2">{payment.fecha}</td>
                <td className="px-4 py-2">
                  {payment.servicios.map((servicio, index) => (
                    <div key={index}>
                      {servicio.serviceName} - $
                      {servicio.servicePrice || servicio.customPrice || 0}{' '}
                      <span className="text-gray-500 text-sm">
                        ({servicio.notes || 'Sin notas'})
                      </span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-2">{payment.petName}</td>
                <td className="px-4 py-2">${payment.montoTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center text-gray-500">No se encontraron pagos</div>
      )}

      {/* Resumen */}
      {summary ? (
        <div className="p-4 bg-gray-50 rounded shadow">
            <h3 className="text-lg font-medium">Resumen de Pagos</h3>
            <p><strong>Total Pagado:</strong> ${summary.totalMonto ? summary.totalMonto.toFixed(2) : '0.00'}</p>
            <p><strong>Total Servicios:</strong> {summary.totalServicios ?? '0'}</p>
        </div>
        ) : (
        <div className="text-center text-gray-500">
            No hay datos disponibles para el resumen.
        </div>
        )}


    </div>
  );
};

export default PaymentHistory;

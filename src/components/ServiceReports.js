import React, { useState } from 'react';
import axiosInstance from '../config/axios';
import DatePicker from 'react-datepicker'; // Biblioteca para selección de fechas
import 'react-datepicker/dist/react-datepicker.css';
import { Bar, Pie } from 'react-chartjs-2';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Registrar componentes de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);


const ServiceReports = () => {
  const [startDate, setStartDate] = useState(new Date()); // Fecha inicial
  const [endDate, setEndDate] = useState(new Date()); // Fecha final
  const [period, setPeriod] = useState('MONTHLY'); // Período por defecto
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/reports/services', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          period,
        },
      });

      if (response.data.success) {
        setReportData(response.data.data);
        toast.success('Reporte generado con éxito');
      } else {
        toast.error('Error al generar el reporte');
      }
    } catch (error) {
      console.error('Error al obtener el reporte:', error);
      toast.error('Error al obtener el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const generateChartData = (data) => {
    return {
      labels: data.servicesMetrics.map((service) => service.serviceName),
      datasets: [
        {
          label: 'Veces Usado',
          data: data.servicesMetrics.map((service) => service.totalUsage),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Ingresos Generados',
          data: data.servicesMetrics.map((service) => service.totalRevenue),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
      ],
    };
  };

  const generatePieData = (data, type) => {
    const labels = Object.keys(data[type]);
    const values = Object.values(data[type]);
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        },
      ],
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reporte de Servicios</h1>

      {/* Filtros */}
      <div className="flex space-x-4 mb-6">
        <div>
          <label className="block text-sm font-medium">Inicio</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Fin</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Período</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="WEEKLY">Semanal</option>
            <option value="MONTHLY">Mensual</option>
            <option value="YEARLY">Anual</option>
          </select>
        </div>
        <button
          onClick={fetchReport}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Generar Reporte
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="text-center">Cargando...</div>
      ) : reportData ? (
        <>
          {/* Resumen */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Resumen General</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded shadow">
                <h3 className="text-lg font-medium">Ingresos Totales</h3>
                <p className="text-2xl font-bold">${reportData.totalRevenue}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded shadow">
                <h3 className="text-lg font-medium">Servicios Solicitados</h3>
                <p className="text-2xl font-bold">{reportData.totalServicesUsed}</p>
              </div>
            </div>
          </div>

          {/* Gráfico de barras */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Gráfico de Uso por Servicio</h2>
            <Bar data={generateChartData(reportData)} />
          </div>

          {/* Gráficos de pastel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Ingresos por Categoría</h2>
              <Pie data={generatePieData(reportData, 'revenueByCategory')} />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Uso por Categoría</h2>
              <Pie data={generatePieData(reportData, 'usageByCategory')} />
            </div>
          </div>

          {/* Tabla */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Detalle por Servicio</h2>
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2">Servicio</th>
                  <th className="px-4 py-2">Veces Usado</th>
                  <th className="px-4 py-2">Ingresos Totales</th>
                  <th className="px-4 py-2">Ingresos Promedio</th>
                </tr>
              </thead>
              <tbody>
                {reportData.servicesMetrics.map((service, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{service.serviceName}</td>
                    <td className="px-4 py-2">{service.totalUsage}</td>
                    <td className="px-4 py-2">${service.totalRevenue}</td>
                    <td className="px-4 py-2">${service.averageRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center">No hay datos disponibles</div>
      )}
    </div>
  );
};

export default ServiceReports;

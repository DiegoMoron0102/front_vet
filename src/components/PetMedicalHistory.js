import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import Modal from '../components/common/Modal/Modal';

const PetMedicalHistory = () => {
  const [historial, setHistorial] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [petName, setPetName] = useState('');
  
  const { petId } = useParams();
  const navigate = useNavigate();

  const loadHistorial = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/historial-clinico/mascota/${petId}`);
      console.log('Datos recibidos del backend:', response.data);
      
      if (response.data.success) {
        setHistorial(response.data.data.map(record => ({
          ...record,
          serviciosRealizados: record.serviciosRealizados || [],
        })));
        if (response.data.data.length > 0) {
          setPetName(response.data.data[0].petName);
        }
      }
    } catch (error) {
      console.error('Error cargando historial:', error);
      toast.error('Error al cargar el historial clínico');
    } finally {
      setIsLoading(false);
    }
  }, [petId]);
  
  

  useEffect(() => {
    loadHistorial();
  }, [loadHistorial]);

  const RecordDetailsModal = () => (
    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Detalles de la Consulta"
    >
      <div className="space-y-6 max-w-2xl">
        {/* Detalles básicos */}
        <div>
          <h4 className="text-sm font-medium text-gray-500">Fecha de Visita</h4>
          <p className="mt-1">{format(new Date(selectedRecord.fechaVisita), 'dd/MM/yyyy HH:mm')}</p>
        </div>
  
        <div>
          <h4 className="text-sm font-medium text-gray-500">Veterinario</h4>
          <p className="mt-1">{selectedRecord.veterinarianName}</p>
        </div>
  
        <div>
          <h4 className="text-sm font-medium text-gray-500">Motivo de Consulta</h4>
          <p className="mt-1">{selectedRecord.motivoConsulta}</p>
        </div>
  
        <div>
          <h4 className="text-sm font-medium text-gray-500">Diagnóstico</h4>
          <p className="mt-1">{selectedRecord.diagnostico}</p>
        </div>
  
        <div>
          <h4 className="text-sm font-medium text-gray-500">Tratamiento</h4>
          <p className="mt-1">{selectedRecord.tratamiento}</p>
        </div>
  
        {selectedRecord.observaciones && (
          <div>
            <h4 className="text-sm font-medium text-gray-500">Observaciones</h4>
            <p className="mt-1">{selectedRecord.observaciones}</p>
          </div>
        )}
  
        {/* Servicios realizados */}
        <div>
          <h4 className="text-sm font-medium text-gray-500">Servicios Realizados</h4>
          <ul className="mt-2 space-y-2">
            {selectedRecord.serviciosRealizados.map((servicio, index) => (
              <li key={index} className="border-b border-gray-200 pb-2">
                <div className="flex justify-between items-center">
                  {/* Mostrar el nombre del servicio */}
                  <p className="text-sm text-gray-700 font-medium">{servicio.serviceName}</p>
                  {/* Mostrar el precio personalizado o el precio base */}
                  <p className="text-sm text-gray-500">
                    ${servicio.precioPersonalizado || servicio.precioBase || 'No especificado'}
                  </p>
                </div>
                {/* Mostrar las notas, si existen */}
                {servicio.notas && (
                  <p className="mt-1 text-sm text-gray-500">Notas: {servicio.notas}</p>
                )}
              </li>
            ))}
          </ul>
        </div>

  
        {/* Botón para cerrar */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="w-full mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
  
  

  return (
    <div className="p-6">
      {/* Header con navegación */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-6 w-6 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Historial Clínico de la Mascota - {petName}
        </h1>
      </div>

      {/* Tabla simple */}
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      ) : historial.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay registros médicos disponibles</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veterinario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motivo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {historial.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(record.fechaVisita), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.veterinarianName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {record.motivoConsulta.substring(0, 50)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-sm
                      ${record.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {record.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                    >
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalles */}
      {selectedRecord && <RecordDetailsModal />}
    </div>
  );
};

export default PetMedicalHistory;
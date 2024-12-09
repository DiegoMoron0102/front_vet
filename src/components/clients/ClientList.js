// ClientList.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../common/Table/Table';
import clientService from '../../services/clientService';
import petService from '../../services/petService';
import toast from 'react-hot-toast';
import Modal from '../common/Modal/Modal';
import ScheduleAppointment from '../ScheduleAppointment';
import { Search, X, Calendar, Clock, PlusCircle } from 'lucide-react'; 

// Componente SearchBox separado
const SearchBox = ({ searchTerm, onSearchChange, onClear }) => (
  <div className="relative w-full max-w-md">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Buscar por nombre..."
      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 
               bg-white placeholder-gray-500 focus:outline-none focus:ring-2 
               focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
    />
    {searchTerm && (
      <button
        onClick={onClear}
        className="absolute inset-y-0 right-0 pr-3 flex items-center"
      >
        <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
      </button>
    )}
  </div>
);

const ClientList = () => {
  // Estados principales
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Estados para el modal de agenda
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // Estados para paginación y ordenamiento
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: false
  });

  

  const [sortConfig, setSortConfig] = useState({
    sortBy: 'nombre',
    sortDirection: 'ASC'
  });
  

  // Función para cargar clientes
  const loadClients = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const paginationRequest = {
        page: pagination.pageNumber,
        size: pagination.pageSize,
        sortBy: sortConfig.sortBy,
        sortDirection: sortConfig.sortDirection
      };

      if (searchTerm && searchTerm.trim().length >= 2) {
        paginationRequest.search = searchTerm.trim();
      }

      const response = await clientService.getClients(paginationRequest);

      if (response?.content) {
        setClients(response.content);
        setPagination(prev => ({
          ...prev,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          last: response.last || false
        }));
      } else {
        setClients([]);
        setPagination(prev => ({
          ...prev,
          totalElements: 0,
          totalPages: 0,
          last: true
        }));
      }
    } catch (error) {
      console.error('Error cargando clientes:', error);
      toast.error('Error al cargar la lista de clientes');
      setError('Error al cargar los clientes');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, sortConfig, searchTerm]);

  // Manejadores de eventos
  const handleSelectClient = async (client) => {
    try {
      setSelectedClient(client);
      setIsLoading(true);
      setError('');

      const response = await petService.getPetsByClientId(client.uid);
      if (response.success) {
        setPets(response.mascotas);
      } else {
        setError('No se encontraron mascotas para este cliente');
        setPets([]);
      }
    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      setError('Error al cargar las mascotas del cliente');
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleAppointment = (pet) => {
    console.log('Agendando cita para mascota:', pet);
    setSelectedPet(pet);
    setIsSchedulingModalOpen(true);
  };

  const handleSchedulingSuccess = () => {
    setIsSchedulingModalOpen(false);
    toast.success('Cita agendada exitosamente');
  };

  const handleAddHistory = (pet) => {
    if (!pet || !pet.id) {
      toast.error('Error: No se pudo identificar la mascota');
      return;
    }
    navigate(`/historial-clinico/mascota/${pet.id}`);
  };
  
  

  const handleViewHistory = (pet) => {
    if (!pet || !pet.id) {
      toast.error('Error: No se pudo identificar la mascota');
      return;
    }
    // Navegar a la página de historial
    navigate(`/pets/${pet.id}/history`);
  };
  

  // Manejadores de búsqueda
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  
    searchTimeoutRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, pageNumber: 0 }));
      // Incluir el término de búsqueda en la solicitud
      loadClients();
    }, 500);
  }, [loadClients]);

  const handleSearchClear = useCallback(() => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    loadClients();
  }, [loadClients]);

  // Effects
  useEffect(() => {
    loadClients();// Carga los servicios al iniciar
  }, [loadClients]);
  

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  
  

  return (
    <div className="p-6">
      {/* Cabecera y búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
          {isLoading && (
            <div className="animate-pulse text-sm text-gray-500">
              Cargando...
            </div>
          )}
        </div>

        <div className="flex space-x-4 items-center">
          <SearchBox 
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClear={handleSearchClear}
          />
        </div>
      </div>

      {/* Tabla de clientes */}
      <Table
        columns={[
          { 
            key: 'nombre', 
            label: 'Nombre', 
            render: (row) => `${row.nombre} ${row.apellido}`,
            sortable: true
          },
          { 
            key: 'email', 
            label: 'Email',
            sortable: true
          },
          { 
            key: 'telefono', 
            label: 'Teléfono'
          },
          { 
            key: 'actions', 
            label: 'Acciones', 
            render: (row) => (
              <button
                onClick={() => handleSelectClient(row)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md 
                         hover:bg-purple-200 transition-colors duration-200"
              >
                Seleccionar
              </button>
            ) 
          }
        ]}
        data={clients}
        pagination={pagination}
        onPageChange={(newPage) => setPagination(prev => ({ ...prev, pageNumber: newPage }))}
        onSort={(key) => setSortConfig(prev => ({
          sortBy: key,
          sortDirection: prev.sortBy === key && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC'
        }))}
        isLoading={isLoading}
      />

      {/* Lista de mascotas del cliente seleccionado */}
      {selectedClient && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-6">
            Mascotas de {selectedClient.nombre} {selectedClient.apellido}
          </h3>
          
          {pets.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500">Este cliente no tiene mascotas registradas</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pets.map(pet => (
                <div 
                  key={pet.id}
                  className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden 
                           hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4">
                    <h4 className="text-lg font-semibold text-gray-900">{pet.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {pet.species} ({pet.breed})
                    </p>
                    <p className="text-sm text-gray-500">
                      {pet.age} años
                    </p>
                    
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => handleScheduleAppointment(pet)}
                        className="w-full flex items-center justify-center px-4 py-2 
                                 bg-purple-100 text-purple-700 rounded-md
                                 hover:bg-purple-200 transition-colors duration-200"
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Agendar Cita
                      </button>

                      <button
                        onClick={() => handleViewHistory(pet)}
                        className="w-full flex items-center justify-center px-4 py-2 
             bg-blue-100 text-blue-700 rounded-md
             hover:bg-blue-200 transition-colors duration-200"
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Ver Historial
                      </button>

                      <button
                        onClick={() => handleAddHistory(pet)}
                        className="w-full flex items-center justify-center px-4 py-2 
             bg-green-100 text-green-700 rounded-md
             hover:bg-green-200 transition-colors duration-200"
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Agregar Historial
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mensajes de error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Modal de agendamiento */}
      {isSchedulingModalOpen && selectedPet && selectedClient && (
        <Modal
          isOpen={isSchedulingModalOpen}
          onClose={() => setIsSchedulingModalOpen(false)}
          title={`Agendar Cita para ${selectedPet.name}`}
        >
          <ScheduleAppointment
            petId={selectedPet.id}
            clientId={selectedClient.uid}
            onSuccess={handleSchedulingSuccess}
            onCancel={() => setIsSchedulingModalOpen(false)}
          />
        </Modal>
      )}
      
    </div>
  );
};

export default ClientList;
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Table from './common/Table/Table';
import Modal from './common/Modal/Modal';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext'; // Contexto de autenticación
import { Search, X, Heart } from 'lucide-react'; // Importar íconos para favoritos

const SearchBox = ({ searchTerm, onSearchChange, onClear }) => (
  <div className="relative w-full max-w-md">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Buscar servicios..."
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

const ServiceList = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const { user } = useAuth(); 

  // Verificar si el usuario es veterinario
  const isVeterinario = user?.roles?.includes('VETERINARIO');

  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: false,
  });
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchTimeoutRef = useRef(null);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
  
      if (showFavorites && isVeterinario) {
        const favoritesResponse = await axios.get('/favorites');
        const favoriteServices = favoritesResponse.data.data || [];
  
        // Filtrar solo servicios veterinarios y cargar detalles completos
        const veterinaryServices = favoriteServices.filter(
          (item) => item.itemType === 'VETERINARY_SERVICE'
        );
  
        const servicesWithDetails = await Promise.all(
          veterinaryServices.map(async (item) => {
            try {
              const serviceDetails = await axios.get(`/services/${item.itemId}/details`);
              return {
                id: item.itemId,
                name: serviceDetails.data.data.name,
                description: serviceDetails.data.data.description,
                category: serviceDetails.data.data.category,
                price: serviceDetails.data.data.price,
                favorito: true, // Este servicio está marcado como favorito
              };
            } catch (error) {
              console.error(`Error cargando detalles del servicio ${item.itemId}:`, error);
              return {
                id: item.itemId,
                name: item.itemName,
                price: item.price,
                favorito: true,
              };
            }
          })
        );
  
        setServices(servicesWithDetails);
        setPagination((prev) => ({
          ...prev,
          totalElements: servicesWithDetails.length,
          totalPages: 1, // Solo una página para favoritos
        }));
      } else {
        // Lógica existente para cargar todos los servicios
        let url = `/services?page=${pagination.pageNumber}&size=${pagination.pageSize}&sortBy=name&sortDirection=ASC`;
  
        if (searchTerm && category !== 'All') {
          url += `&filterBy=name&filterValue=${searchTerm}&category=${category}`;
        } else if (searchTerm) {
          url += `&filterBy=name&filterValue=${searchTerm}`;
        } else if (category !== 'All') {
          url += `&category=${category}`;
        }
  
        const response = await axios.get(url);
        const servicesData = response?.data?.data?.content || [];
  
        let favoriteServiceIds = [];
        if (isVeterinario) {
          const favoritesResponse = await axios.get('/favorites');
          const favoriteServices = favoritesResponse.data.data || [];
          favoriteServiceIds = favoriteServices.map((item) => item.itemId);
        }
  
        const servicesWithFavorites = servicesData.map((service) => ({
          ...service,
          favorito: favoriteServiceIds.includes(service.id),
        }));
  
        setServices(servicesWithFavorites);
        setPagination((prev) => ({
          ...prev,
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 0,
          last: response.data.data.last || false,
        }));
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
      toast.error('Error al cargar la lista de servicios');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, searchTerm, category, showFavorites, isVeterinario]);
  
  const toggleFavorite = async (serviceId) => {
    if (!isVeterinario) return; // Solo los veterinarios pueden agregar o quitar favoritos

    try {
      const response = await axios.post('/favorites/toggle', {
        itemId: serviceId,
        itemType: 'VETERINARY_SERVICE',
      });
      const isFavorite = response.data.data !== null;
  
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId ? { ...service, favorito: isFavorite } : service
        )
      );
  
      toast.success(isFavorite ? 'Marcado como favorito' : 'Removido de favoritos');
    } catch (error) {
      console.error('Error al alternar favorito:', error);
      toast.error('Error al actualizar favorito');
    }
  };
  
  

  
  

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => loadServices(), 500);
  };

  const handleSearchClear = () => {
    setSearchTerm('');
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    loadServices();
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, pageNumber: newPage }));
    loadServices();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPagination((prev) => ({ ...prev, pageNumber: 0 }));
    loadServices();
  };

  const handleViewDetails = async (service) => {
    try {
      const response = await axios.get(`/services/${service.id}/details`);
      if (response.data.success) {
        const details = response.data.data;
        setSelectedService(details);
        setIsModalOpen(true);
      } else {
        toast.error('No se pudieron cargar los detalles del servicio');
      }
    } catch (error) {
      console.error('Error al obtener detalles del servicio:', error);
      toast.error('Error al cargar los detalles del servicio');
    }
  };

  const closeModal = () => {
    setSelectedService(null);
    setIsModalOpen(false);
  };

  useEffect(() => {
    
    const loadCategories = async () => {
      try {
        const response = await axios.get('/services/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          toast.error('Error al cargar las categorías de servicios');
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
        toast.error('Error al cargar las categorías');
      }
    };

    
    loadCategories();
    loadServices();
  }, [loadServices]);
  

  return (
    <div className="p-6">
      <div className="mb-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Servicios para Mascotas</h2>
        <div className="flex space-x-4 items-center">
          <SearchBox
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onClear={handleSearchClear}
          />
          <select
            value={category}
            onChange={handleCategoryChange}
            className="border px-4 py-2 rounded"
          >
            <option value="All">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {isVeterinario && (
            <button
              onClick={() => setShowFavorites((prev) => !prev)}
              className={`px-4 py-2 rounded ${showFavorites ? 'bg-purple-500 text-white' : 'bg-gray-300 text-black'}`}
            >
              {showFavorites ? 'Ver Todos' : 'Ver Favoritos'}
            </button>
          )}
        </div>
      </div>

      <Table
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'category', label: 'Categoría' },
          { key: 'price', label: 'Precio', render: (row) => `$${row.price}` },
          { key: 'description', label: 'Descripción' },
          ...(isVeterinario
            ? [
                {
                  key: 'favorite',
                  label: 'Favorito',
                  render: (row) => (
                    <button onClick={() => toggleFavorite(row.id)}>
                      <Heart className={row.favorito ? 'text-red-500 fill-current' : ''} />
                    </button>
                  ),
                },
              ]
            : []),    
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <button
                onClick={() => handleViewDetails(row)}
                className="px-3 py-1 bg-blue-500 text-white rounded"
              >
                Ver Detalles
              </button>
            ),
          },
        ]}
        data={services}
        pagination={pagination}
        onPageChange={(newPage) => handlePageChange(newPage)}
        isLoading={isLoading}
      />

{isModalOpen && selectedService && (
  <Modal isOpen={isModalOpen} onClose={closeModal} title="Detalles del Servicio">
    <div className="space-y-4">
      {/* Nombre del servicio */}
      <div>
        <h3 className="text-xl font-bold">{selectedService.name}</h3>
      </div>

      {/* Descripción */}
      {selectedService.description && (
        <div>
          <p>
            <strong>Descripción:</strong> {selectedService.description}
          </p>
        </div>
      )}

      {/* Precio */}
      <div>
        <p>
          <strong>Precio:</strong> ${selectedService.price}
        </p>
      </div>

      {/* Categoría */}
      {selectedService.category && (
        <div>
          <p>
            <strong>Categoría:</strong> {selectedService.category}
          </p>
        </div>
      )}

      {/* Duración */}
      {selectedService.durationMinutes && (
        <div>
          <p>
            <strong>Duración:</strong> {selectedService.durationMinutes} minutos
          </p>
        </div>
      )}

      {/* Requisitos */}
      {selectedService.requirements?.length > 0 && (
        <div>
          <p>
            <strong>Requisitos:</strong>
          </p>
          <ul className="list-disc ml-6">
            {selectedService.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recomendaciones */}
      {selectedService.recommendations?.length > 0 && (
        <div>
          <p>
            <strong>Recomendaciones:</strong>
          </p>
          <ul className="list-disc ml-6">
            {selectedService.recommendations.map((rec, index) => (
              <li key={index}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Advertencias */}
      {selectedService.warnings?.length > 0 && (
        <div>
          <p>
            <strong>Advertencias:</strong>
          </p>
          <ul className="list-disc ml-6">
            {selectedService.warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón para cerrar */}
      <div>
        <button
          onClick={closeModal}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Cerrar
        </button>
      </div>
    </div>
  </Modal>
)}

    </div>
  );
};

export default ServiceList;

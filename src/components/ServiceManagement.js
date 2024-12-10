import React, { useState, useEffect, useCallback, useRef } from 'react';
import Table from './common/Table/Table';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Componente SearchBox
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

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0,
    last: false,
  });
  const searchTimeoutRef = useRef(null);
  const navigate = useNavigate();

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      let url = `/services?page=${pagination.pageNumber}&size=${pagination.pageSize}&sortBy=name&sortDirection=ASC`;

      if (searchTerm && category !== 'All') {
        url += `&filterBy=name&filterValue=${searchTerm}&category=${category}`;
      } else if (searchTerm) {
        url += `&filterBy=name&filterValue=${searchTerm}`;
      } else if (category !== 'All') {
        url += `&category=${category}`;
      }

      const response = await axios.get(url);
      if (response?.data?.data?.content) {
        const mappedServices = response.data.data.content.map((service) => ({
          ...service,
          durationMinutes: service.durationMinutes || 'No especificado',
        }));

        setServices(mappedServices);
        setPagination((prev) => ({
          ...prev,
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 0,
          last: response.data.data.last || false,
        }));
      } else {
        setServices([]);
        setPagination((prev) => ({
          ...prev,
          totalElements: 0,
          totalPages: 0,
          last: true,
        }));
      }
    } catch (error) {
      console.error('Error cargando servicios:', error);
      toast.error('Error al cargar la lista de servicios');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, searchTerm, category]);

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

  const handleDeleteService = async (id) => {
    try {
      await axios.delete(`/services/${id}`);
      toast.success('Servicio eliminado exitosamente');
      loadServices();
    } catch (error) {
      toast.error('Error al eliminar el servicio');
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Gestión de Servicios Veterinarios</h2>
      <div className="mb-6 space-y-4">
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
        <button
          onClick={() => navigate('/admin/services/new')}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Agregar Servicio
        </button>
      </div>

      <Table
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'category', label: 'Categoría' },
          { key: 'price', label: 'Precio', render: (row) => `$${row.price}` },
          {
            key: 'durationMinutes',
            label: 'Duración (min)',
            render: (row) => row.durationMinutes || 'No especificado',
          },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="space-x-2">
                <button
                  onClick={() => navigate(`/admin/services/edit/${row.id}`)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteService(row.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Eliminar
                </button>
              </div>
            ),
          },
        ]}
        data={services}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ServiceManagement;

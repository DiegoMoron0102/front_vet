import React, { useState, useEffect, useCallback, useRef } from 'react';
import Table from './common/Table/Table';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import Modal from './common/Modal/Modal';
import { Search, X } from 'lucide-react';

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    requirements: [],
    recommendations: [],
    warnings: [],
  });
  const searchTimeoutRef = useRef(null);

  const loadServices = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = {
        page: pagination.pageNumber,
        size: pagination.pageSize,
        searchTerm: searchTerm || null,
        category: category !== 'All' ? category : null,
      };
  
      const response = await axios.get('/services/list', { params });
  
      // Agregar el console.log para verificar la respuesta de la base de datos
      console.log('Datos obtenidos de /services/list:', response.data);
  
      if (response?.data?.data?.content) {
        setServices(response.data.data.content);
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
    loadServices(); // Llamamos a loadServices aquí para inicializar los datos
  }, [loadServices]);

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        durationMinutes: formData.duration,
        category: formData.category,
        requirements: formData.requirements,
        recommendations: formData.recommendations,
        warnings: formData.warnings,
      };

      await axios.post('/services', data);  // POST request para agregar servicio
      toast.success('Servicio agregado exitosamente');
      loadServices();
      closeForm();
    } catch (error) {
      toast.error('Error al agregar el servicio');
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await axios.delete(`/services/${id}`); // DELETE request para eliminar servicio
      toast.success('Servicio eliminado exitosamente');
      loadServices();
    } catch (error) {
      toast.error('Error al eliminar el servicio');
    }
  };

  const openForm = async (service) => {
    if (service) {
      try {
        const response = await axios.get(`/services/${service.id}/details`);
        if (response.data.success) {
          const details = response.data.data;
  
          setFormData({
            name: details.name || '',
            description: details.description || '',
            price: details.price || '',
            duration: details.durationMinutes || '', // Corregido
            category: details.category || '',
            requirements: details.requirements || [''],
            recommendations: details.recommendations || [''],
            warnings: details.warnings || [''],
          });
        } else {
          toast.error('No se pudieron cargar los detalles del servicio');
        }
      } catch (error) {
        console.error('Error al obtener detalles del servicio:', error);
        toast.error('Error al cargar los detalles del servicio');
      }
    } else {
      // Si es para agregar un servicio nuevo
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        category: '',
        requirements: [''],
        recommendations: [''],
        warnings: [''],
      });
    }
  
    setSelectedService(service || null);
    setIsEditing(!!service);
    setIsModalOpen(true);
  };
  
  
  const validateFormData = (data) => {
    return (
      data.name.trim() !== '' &&
      data.description.trim() !== '' &&
      data.price > 0 &&
      data.duration > 0 &&
      data.category.trim() !== ''
    );
  };
  
  const handleEditService = async (e) => {
    e.preventDefault();
    if (!validateFormData(formData)) {
      toast.error('Por favor, complete todos los campos requeridos.');
      return;
    }
    try {
      await axios.put(`/services/${selectedService.id}`, {
        ...formData,
        durationMinutes: formData.duration,
      });
      toast.success('Servicio actualizado exitosamente.');
      loadServices();
      closeForm();
    } catch (error) {
      console.error('Error editing service:', error);
      const errorMessage =
        error.response?.data?.message || 'Hubo un problema al intentar actualizar el servicio.';
      toast.error(errorMessage);
    }
  };
  
  
  const closeForm = () => {
    setIsModalOpen(false);
    setSelectedService(null);
    setIsEditing(false);
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
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button onClick={() => openForm()} className="px-4 py-2 bg-green-500 text-white rounded">
          Agregar Servicio
        </button>
      </div>

      {/* Modal para agregar/editar servicios */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeForm} title={isEditing ? 'Editar Servicio' : 'Agregar Servicio'}>
          <form onSubmit={isEditing ? handleEditService : handleAddService} className="space-y-4">
            <input
              type="text"
              placeholder="Nombre"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Precio"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="number"
              placeholder="Duración (min)"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full p-2 border rounded"
              required
            />
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <textarea
              placeholder="Requisitos (separa por comas)"
              value={formData.requirements.join(', ')}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value.split(',').map(item => item.trim()) })}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Recomendaciones (separa por comas)"
              value={formData.recommendations.join(', ')}
              onChange={(e) => setFormData({ ...formData, recommendations: e.target.value.split(',').map(item => item.trim()) })}
              className="w-full p-2 border rounded"
            />
            <textarea
              placeholder="Advertencias (separa por comas)"
              value={formData.warnings.join(', ')}
              onChange={(e) => setFormData({ ...formData, warnings: e.target.value.split(',').map(item => item.trim()) })}
              className="w-full p-2 border rounded"
            />
            <div className="flex space-x-2">
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                {isEditing ? 'Actualizar' : 'Agregar'}
              </button>
              <button type="button" onClick={closeForm} className="px-4 py-2 bg-gray-300 rounded">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Tabla de servicios */}
      <Table
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'category', label: 'Categoría' },
          { key: 'price', label: 'Precio', render: (row) => `$${row.price}` },
          { key: 'durationMinutes', label: 'Duración (min)' },
          {
            key: 'actions',
            label: 'Acciones',
            render: (row) => (
              <div className="space-x-2">
                <button onClick={() => openForm(row)} className="px-3 py-1 bg-yellow-500 text-white rounded">Editar</button>
                <button onClick={() => handleDeleteService(row.id)} className="px-3 py-1 bg-red-500 text-white rounded">Eliminar</button>
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

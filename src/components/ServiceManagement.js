import React, { useState, useEffect, useCallback, useRef } from 'react';
import Table from './common/Table/Table';
import axios from '../config/axios';
import toast from 'react-hot-toast';
import Modal from './common/Modal/Modal';

// Componente SearchBox (lo definimos aquí para evitar el error)
const SearchBox = ({ searchTerm, onSearchChange, onClear }) => (
  <div className="relative w-full max-w-md">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m2.7-5.65a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
      </svg>
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
        <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
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
    category: '', // Añadimos categoría en el estado inicial
  });
  const searchTimeoutRef = useRef(null);

  const loadCategories = useCallback(async () => {
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
  }, []);

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

  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/services', formData);
      toast.success('Servicio agregado exitosamente');
      loadServices();
      closeForm();
    } catch (error) {
      toast.error('Error al agregar el servicio');
    }
  };

  const handleEditService = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/services/${selectedService.id}`, formData);
      toast.success('Servicio actualizado exitosamente');
      loadServices();
      closeForm();
    } catch (error) {
      toast.error('Error al actualizar el servicio');
    }
  };

  const handleDeleteService = async (id) => {
    try {
      await axios.delete(`/services/${id}`);
      toast.success('Servicio eliminado exitosamente');
      loadServices();
    } catch (error) {
      toast.error('Error al eliminar el servicio');
    }
  };

  const openForm = (service = null) => {
    setFormData({
      name: service?.name || '',
      description: service?.description || '',
      price: service?.price || '',
      duration: service?.duration || '',
      category: service?.category || '', // Añadir categoría en el estado inicial del formulario
    });
    setSelectedService(service);
    setIsEditing(!!service);
    setIsModalOpen(true);
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
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
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

  useEffect(() => {
    loadCategories();
    loadServices();
  }, [loadCategories, loadServices]);

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
          ></textarea>
          <input
            type="number"
            placeholder="Precio"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            placeholder="Duración (min)"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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

      <Table
        columns={[
          { key: 'name', label: 'Nombre' },
          { key: 'category', label: 'Categoría' },
          { key: 'price', label: 'Precio', render: (row) => `$${row.price}` },
          { key: 'duration', label: 'Duración (min)' },
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

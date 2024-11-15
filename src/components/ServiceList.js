import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from '../config/axios';
import toast from 'react-hot-toast';
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

const ServiceList = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState('All');
    const searchTimeoutRef = useRef(null);

    // Paginación
    const [pagination, setPagination] = useState({
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        last: false
    });

    // Cargar las categorías
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
                console.error("Error cargando categorías:", error);
                toast.error('Error al cargar las categorías');
            }
        };
        loadCategories();
    }, []);

    // Cargar los servicios en base a parámetros de búsqueda y paginación
    const loadServices = useCallback(async () => {
        try {
            const paginationRequest = {
                page: pagination.pageNumber,
                size: pagination.pageSize,
                searchTerm: searchTerm || null,
                category: category !== 'All' ? category : null,
            };

            const response = await axios.get('/services/list', { params: paginationRequest });

            if (response?.data?.data?.content) {
                setServices(response.data.data.content);
                setPagination(prev => ({
                    ...prev,
                    totalElements: response.data.data.totalElements || 0,
                    totalPages: response.data.data.totalPages || 0,
                    last: response.data.data.last || false
                }));
            } else {
                setServices([]);
                setPagination(prev => ({
                    ...prev,
                    totalElements: 0,
                    totalPages: 0,
                    last: true
                }));
            }
        } catch (error) {
            console.error('Error cargando servicios:', error);
            toast.error('Error al cargar la lista de servicios');
        }
    }, [pagination.pageNumber, pagination.pageSize, searchTerm, category]);

    // Maneja el cambio en la barra de búsqueda con debounce
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

    // Cambia la página al hacer clic en "Anterior" o "Siguiente"
    const handlePageChange = (newPage) => {
        setPagination((prev) => ({ ...prev, pageNumber: newPage }));
        loadServices();
    };

    // Cambia la categoría y reinicia la página
    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setPagination((prev) => ({ ...prev, pageNumber: 0 })); // Reinicia a la primera página
        loadServices();
    };

    // Ejecuta loadServices cada vez que los valores cambian
    useEffect(() => {
        loadServices();
    }, [pagination.pageNumber, category, searchTerm, loadServices]);

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
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Lista de Servicios */}
            <ul className="space-y-4">
                {services.map(service => (
                    <li key={service.id} className="p-4 border rounded-md">
                        <h2 className="text-lg font-semibold">{service.name}</h2>
                        <p className="text-gray-600">{service.category}</p>
                        <p>{service.description}</p>
                        <p className="text-gray-500">Precio: ${service.price}</p>
                        <p className="text-gray-500">Duración: {service.durationMinutes} minutos</p>
                    </li>
                ))}
            </ul>

            {/* Controles de Paginación */}
            <div className="flex justify-between mt-4">
                <button
                    disabled={pagination.pageNumber === 0}
                    onClick={() => handlePageChange(pagination.pageNumber - 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded"
                >
                    Anterior
                </button>
                <button
                    disabled={pagination.last}
                    onClick={() => handlePageChange(pagination.pageNumber + 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-600 rounded"
                >
                    Siguiente
                </button>
            </div>
        </div>
    );
};

export default ServiceList;

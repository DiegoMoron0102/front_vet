import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, AlertTriangle, X, Search } from 'lucide-react'; // Añadido Search aquí
import Table from '../components/common/Table/Table';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import InventoryForm from './inventory/InventoryForm';

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
      placeholder="Buscar productos..."
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

// Componente modal de formulario
const FormModal = ({ isOpen, onClose, title, initialData, onSubmit }) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <InventoryForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};

// Componente principal
const InventoryManagement = () => {
  // Estados para los datos y configuración
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [alerts, setAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Estados para modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Estado para paginación
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  // Estado para ordenamiento
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'name',
    sortDirection: 'ASC'
  });

  // Referencia para el timeout de búsqueda
  const searchTimeoutRef = useRef(null);

  // Constantes para estados de productos
  const STATUS_OPTIONS = {
    ALL: 'Todos',
    IN_STOCK: 'En Stock',
    LOW_STOCK: 'Stock Bajo',
    OUT_OF_STOCK: 'Sin Stock'
  };

  // Función para cargar el inventario
  const loadInventory = useCallback(async () => {
    try {
      setIsLoading(true);

      // Construir parámetros base
      const params = {
        page: pagination.pageNumber,
        size: pagination.pageSize,
        sortBy: sortConfig.sortBy,
        sortDirection: sortConfig.sortDirection,
      };

      let response;
      if (searchTerm.trim() !== "") {
        // Llamada al endpoint de búsqueda
        response = await axiosInstance.get("/inventory/search", {
          params: { ...params, searchTerm },
        });
      } else {
        // Llamada al endpoint estándar
        response = await axiosInstance.get("/inventory", { params });
      }

      if (response.data.success) {
        setInventory(response.data.data.content || []);
        setPagination(prev => ({
          ...prev,
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Error al cargar el inventario');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, sortConfig, searchTerm]);

  // Función para cargar alertas
  const loadAlerts = useCallback(async () => {
    try {
      setIsLoadingAlerts(true);
      const response = await axiosInstance.get('/inventory/low-stock', {
        params: {
          page: 0,
          size: 10,
          sortBy: 'name',
          sortDirection: 'ASC'
        }
      });

      if (response.data.success) {
        setAlerts(response.data.data.content || []);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      toast.error('Error al cargar alertas de stock bajo');
    } finally {
      setIsLoadingAlerts(false);
    }
  }, []);

  // Efectos para cargar datos iniciales
  useEffect(() => {
    loadInventory();
    loadAlerts();
  }, [loadInventory, loadAlerts]);

  // Manejadores de eventos
  const handleSubmitAdd = async (values) => {
    try {
      const response = await axiosInstance.post('/inventory/items', values);
      if (response.data.success) {
        toast.success('Producto agregado exitosamente');
        setIsAddModalOpen(false);
        loadInventory();
      }
    } catch (error) {
      toast.error('Error al agregar el producto');
      throw error; // Propagar el error para que el formulario lo maneje
    }
  };

  const handleSubmitEdit = async (values) => {
    try {
      const response = await axiosInstance.put(`/inventory/items/${selectedItem.id}`, values);
      if (response.data.success) {
        toast.success('Producto actualizado exitosamente');
        setIsEditModalOpen(false);
        loadInventory();
      }
    } catch (error) {
      toast.error('Error al actualizar el producto');
      throw error;
    }
  };

  const handleViewDetails = async (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  // Manejadores de búsqueda y filtros
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Solo hacer la búsqueda si hay un término de búsqueda
    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => loadInventory(), 200);
    } else {
      // Si el término de búsqueda está vacío, cargar todos los productos
      loadInventory();
    }
  }, [loadInventory]);

  const handleSearchClear = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, pageNumber: 0 }));
    loadInventory();
  };

  // Componente para las alertas de stock bajo
  const LowStockAlerts = () => {
    if (isLoadingAlerts) {
      return <div className="mb-6 p-4 bg-gray-50">Cargando alertas...</div>;
    }

    if (alerts.length === 0) return null;

    return (
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="flex items-center text-yellow-800 font-medium mb-2">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Alertas de stock bajo
        </h3>
        <ul className="space-y-2">
          {alerts.map((item) => (
            <li key={item.id} className="text-yellow-700">
              {item.productName} - Quedan {item.currentStock} unidades (Mínimo: {item.minThreshold})
              {item.status === 'CRITICAL' && (
                <span className="ml-2 text-red-600 font-bold">(CRÍTICO)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Componente para el modal de visualización
  const ViewModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalles del Producto"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-500">ID</h3>
            <p>{item.id}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Nombre del producto</h3>
            <p>{item.name}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Cantidad actual</h3>
            <p>{item.quantity}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Cantidad mínima</h3>
            <p>{item.minThreshold}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Precio</h3>
            <p>${item.price}</p>
          </div>
          <div>
            <h3 className="font-medium text-gray-500">Fecha de actualización</h3>
            <p>{new Date(item.lastUpdated).toLocaleDateString()}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    );
  };

  // Definición de columnas para la tabla
  const columns = [
    { 
      key: 'name',
      label: 'Producto',
      sortable: true
    },
    {
      key: 'quantity',
      label: 'Cantidad',
      sortable: true
    },
    {
      key: 'status',
      label: 'Estado',
      render: (row) => {
        const getStatusColor = (quantity, minThreshold) => {
          if (quantity <= 0) return 'text-red-600 bg-red-100';
          if (quantity <= minThreshold) return 'text-yellow-600 bg-yellow-100';
          return 'text-green-600 bg-green-100';
        };

        const getStatusText = (quantity, minThreshold) => {
          if (quantity <= 0) return 'Sin Stock';
          if (quantity <= minThreshold) return 'Stock Bajo';
          return 'En Stock';
        };

        return (
          <span className={`px-2 py-1 rounded-full ${getStatusColor(row.quantity, row.minThreshold)}`}>
            {getStatusText(row.quantity, row.minThreshold)}
          </span>
        );
      }
    },
    {
      key: 'price',
      label: 'Precio',
      render: (row) => `$${row.price}`
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            Ver
          </button>
          <button
            onClick={() => handleEdit(row)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
          >
            Editar
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar producto
        </button>
      </div>

      {/* Alertas de stock bajo */}
      <LowStockAlerts />

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <SearchBox
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onClear={handleSearchClear}
        />
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          {Object.entries(STATUS_OPTIONS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <Table
        columns={columns}
        data={inventory}
        pagination={pagination}
        onPageChange={(newPage) => setPagination(prev => ({ ...prev, pageNumber: newPage }))}
        onSort={(key) => setSortConfig(prev => ({
          sortBy: key,
          sortDirection: prev.sortBy === key && prev.sortDirection === 'ASC' ? 'DESC' : 'ASC'
        }))}
        isLoading={isLoading}
      />

      {/* Modales */}
      <FormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Agregar Producto"
        onSubmit={handleSubmitAdd}
      />

      <FormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Producto"
        initialData={selectedItem}
        onSubmit={handleSubmitEdit}
      />

      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedItem}
      />
      {/* Estilos CSS personalizados para la paginación */}
      <style jsx>{`
        .pagination-button {
          padding: 0.5rem 1rem;
          margin: 0 0.25rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          background-color: white;
          color: #4a5568;
          transition: all 0.2s;
        }

        .pagination-button:hover {
          background-color: #f7fafc;
        }

        .pagination-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-button.active {
          background-color: #9f7aea;
          color: white;
          border-color: #9f7aea;
        }

        .table-container {
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
          border-radius: 0.5rem;
          overflow: hidden;
        }

        .alert-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          line-height: 1.25rem;
        }

        .alert-badge.warning {
          background-color: #fef3c7;
          color: #92400e;
        }

        .alert-badge.danger {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .alert-badge.success {
          background-color: #d1fae5;
          color: #047857;
        }

        .modal-overlay {
          background-color: rgba(0, 0, 0, 0.5);
          transition: opacity 0.2s ease-in-out;
        }

        .modal-content {
          transform: scale(0.95);
          opacity: 0;
          transition: all 0.2s ease-in-out;
        }

        .modal-content.open {
          transform: scale(1);
          opacity: 1;
        }

        .hover-trigger .hover-target {
          display: none;
        }

        .hover-trigger:hover .hover-target {
          display: block;
        }
      `}</style>

      {/* Scripts adicionales para funcionalidades específicas */}
      <script>{`
        // Función para formato de números
        function formatNumber(number) {
          return new Intl.NumberFormat('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          }).format(number);
        }

        // Función para formateo de fechas
        function formatDate(date) {
          return new Intl.DateTimeFormat('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(date));
        }

        // Función para validación de campos numéricos
        function validateNumberInput(input) {
          const value = input.value;
          const numberValue = parseFloat(value);
          
          if (isNaN(numberValue) || numberValue < 0) {
            input.setCustomValidity('Por favor ingrese un número válido mayor o igual a 0');
          } else {
            input.setCustomValidity('');
          }
          
          input.reportValidity();
        }

        // Función para manejar la confirmación de acciones críticas
        function confirmAction(message, callback) {
          if (window.confirm(message)) {
            callback();
          }
        }
      `}</script>
    </div>
  );
};

export default InventoryManagement;
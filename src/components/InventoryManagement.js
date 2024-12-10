import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, AlertTriangle, X } from 'lucide-react';
import Table from '../components/common/Table/Table';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';

const InventoryManagement = () => {
  // Estado para los items del inventario y configuración de la tabla
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  
  // Estado para modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);

  // Estado para formulario
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',  // Cambiado a string vacío
    minThreshold: '', // Cambiado a string vacío
    price: '', // Cambiado a string vacío
    recommendedOrderQuantity: ''
  });
  
  // Estado para paginación y ordenamiento
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  const [sortConfig, setSortConfig] = useState({
    sortBy: 'name',
    sortDirection: 'ASC'
  });

  // Constantes para estados de productos
  const STATUS_OPTIONS = {
    ALL: 'Todos',
    IN_STOCK: 'En Stock',
    LOW_STOCK: 'Stock Bajo',
    OUT_OF_STOCK: 'Sin Stock'
  };

  // Referencia para el timeout de búsqueda
  const searchTimeoutRef = useRef(null);

  // Función para cargar items del inventario (memoizada)
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
            setInventory(response.data.data.content);
            setPagination((prev) => ({
                ...prev,
                totalElements: response.data.data.totalElements,
                totalPages: response.data.data.totalPages,
            }));
        } else {
            setInventory([]);
            setPagination((prev) => ({
                ...prev,
                totalElements: 0,
                totalPages: 0,
            }));
        }
    } catch (error) {
        console.error("Error loading inventory:", error);
        toast.error("Error al cargar el inventario");
    } finally {
        setIsLoading(false);
    }
}, [pagination.pageNumber, pagination.pageSize, sortConfig, searchTerm]);

const handleSearchChange = useCallback(
  (e) => {
      const value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
      setSearchTerm(value);

      // Debounce para limitar llamadas al endpoint
      if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
          // Reiniciar la paginación al buscar
          setPagination((prev) => ({
              ...prev,
              pageNumber: 0,
          }));
          loadInventory();
      }, 200);
  },
  [loadInventory]
);

  // Efecto para cargar datos del inventario
  useEffect(() => {
    // Cargar datos inicialmente o al cambiar la paginación, orden o término de búsqueda
    loadInventory();
}, [loadInventory, pagination.pageNumber, sortConfig]);
const handleInputChange = (e) => {
  const { name, value } = e.target;
  
  // Si el campo está vacío, permitir que esté vacío
  if (value === '') {
    setFormData(prev => ({
      ...prev,
      [name]: ''
    }));
    return;
  }

  // Para campos numéricos, asegurar que sean números válidos
  if (['quantity', 'minThreshold', 'price', 'recommendedOrderQuantity'].includes(name)) {
    // Remover caracteres no numéricos excepto punto decimal para precio
    const sanitizedValue = name === 'price' 
      ? value.replace(/[^\d.]/g, '')
      : value.replace(/\D/g, '');
    
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  } else {
    // Para campos de texto, actualizar normalmente
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }
};
  

  // Funciones de manejo para operaciones CRUD
  const handleAddProduct = () => {
    setFormData({
      name: '',
      quantity: 0,
      minThreshold: 0,
    });
    setIsAddModalOpen(true);
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsViewModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || '',
      quantity: item.quantity?.toString() || '',
      minThreshold: item.minThreshold?.toString() || '',
      price: item.price?.toString() || '',
      recommendedOrderQuantity: item.recommendedOrderQuantity?.toString() || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSubmitAdd = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/inventory/items', formData);
      if (response.data.success) {
        toast.success('Producto agregado exitosamente');
        setIsAddModalOpen(false);
        loadInventory();
      }
    } catch (error) {
      toast.error('Error al agregar el producto');
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        quantity: parseInt(formData.quantity) || 0,
        minThreshold: parseInt(formData.minThreshold) || 0,
        price: parseFloat(formData.price) || 0,
      };
  
      if (formData.recommendedOrderQuantity.trim() !== '') {
        payload.recommendedOrderQuantity = parseInt(formData.recommendedOrderQuantity);
      }
  
      const response = await axiosInstance.put(`/inventory/items/${selectedItem.id}`, payload);
      
      if (response.data.success) {
        toast.success('Producto actualizado exitosamente');
        setIsEditModalOpen(false);
        loadInventory();
        loadAlerts();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el producto');
    }
  };

  // Modal genérico para formularios
  const FormModal = ({ isOpen, onClose, title, onSubmit }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre del producto
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border rounded-md"
                required
                disabled={title === "Editar Producto"}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cantidad
              </label>
              <input
                type="text" // Cambiado de number a text
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cantidad mínima
              </label>
              <input
                type="text" // Cambiado de number a text
                name="minThreshold"
                value={formData.minThreshold}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio
              </label>
              <input
                type="text" // Cambiado de number a text
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
                step="0.01"
                required
              />
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cantidad recomendada de pedido
              </label>
              <input
                type="text" // Cambiado de number a text
                name="recommendedOrderQuantity"
                value={formData.recommendedOrderQuantity}
                onChange={handleInputChange}
                className="mt-1 w-full p-2 border rounded-md"
                min="0"
              />
            </div>
  
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                {title === "Editar Producto" ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Componente para detalles del producto
  const ViewModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Detalles del Producto</h2>
            <button onClick={onClose}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <p>{item.id}</p>
              <h3 className="font-medium text-gray-700">Nombre del producto</h3>
              <p>{item.name}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Cantidad actual</h3>
              <p>{item.quantity}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Cantidad mínima</h3>
              <p>{item.minThreshold}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Fecha de actualización</h3>
              <p>{new Date(item.lastUpdated).toLocaleDateString()}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full mt-4 px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
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
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(row)}
            className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
          >
            Detalles
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

  // Cargar alertas solo al montar el componente
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Sección de alertas de stock bajo
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
          {alerts.map(item => (
            <li key={item.id} className="text-yellow-700">
              {item.productName} - Quedan {item.currentStock} unidades (Mínimo: {item.minThreshold})
              {item.status === 'CRITICAL' &&
                <span className="ml-2 text-red-600 font-bold">(CRÍTICO)</span>
              }
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inventario</h1>
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center"
          onClick={handleAddProduct}
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar producto
        </button>
      </div>

      {/* Alertas de stock bajo */}
      <LowStockAlerts />

      {/* Filtros */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md flex-1"
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

      {/* Tabla de inventario */}
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
        onSubmit={handleSubmitEdit}
      />
      
      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        item={selectedItem}
      />
    </div>
  );
};

export default InventoryManagement;
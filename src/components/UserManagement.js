import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserCog, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import userService from '../services/userService';
import Modal from './common/Modal/Modal';
import UserForm from '../components/users/UserForm';
import axios from '../config/axios';

const UserManagement = () => {
  // Estados para datos y UI
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchTimeoutRef = useRef(null);
  
  // Estados para paginación
  const [pagination, setPagination] = useState({
    pageNumber: 0,
    pageSize: 10,
    totalElements: 0,
    totalPages: 0
  });

  // Estados para ordenamiento
  const [sortConfig] = useState({
    sortBy: 'nombre',
    sortDirection: 'ASC'
  });

  // Función para cargar usuarios
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/users', {
        params: {
          page: pagination.pageNumber,
          size: pagination.pageSize,
          sortBy: sortConfig.sortBy,
          sortDirection: sortConfig.sortDirection,
          role: selectedRole !== 'ALL' ? selectedRole : undefined,
          isActive: selectedStatus !== 'ALL' ? selectedStatus === 'ACTIVE' : undefined
        }
      });

      if (response.data.success) {
        setUsers(response.data.data.content);
        setPagination(prev => ({
          ...prev,
          totalElements: response.data.data.totalElements || 0,
          totalPages: response.data.data.totalPages || 0
        }));
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, selectedRole, selectedStatus, sortConfig]);


  useEffect(() => {
    loadUsers();
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [loadUsers]);
  // Manejadores de eventos para CRUD
  const handleCreateUser = async (userData) => {
    try {
      await userService.createUser(userData);
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error('Error creating user: ' + error.message);
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await userService.updateUser(selectedUser.uid, userData);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        loadUsers();
      } catch (error) {
        toast.error('Error deleting user: ' + error.message);
      }
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userService.toggleUserStatus(userId, !currentStatus);
      toast.success('User status updated successfully');
      loadUsers();
    } catch (error) {
      toast.error('Error updating user status: ' + error.message);
    }
  };

  // Manejadores para paginación y ordenamiento
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, pageNumber: newPage }));
  };
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    
    // Limpiar el timeout anterior si existe
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Solo realizar búsqueda si hay al menos 2 caracteres
    if (value.trim().length >= 2) {
      setIsLoading(true); // Indicar que está cargando
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await axios.get('/users/search', {
            params: {
              searchTerm: value,
              page: 0, // Resetear a primera página
              size: pagination.pageSize,
              sortBy: sortConfig.sortBy,
              sortDirection: sortConfig.sortDirection,
              role: selectedRole !== 'ALL' ? selectedRole : undefined,
              isActive: selectedStatus !== 'ALL' ? selectedStatus === 'ACTIVE' : undefined
            }
          });

          if (response.data.success) {
            setUsers(response.data.data.content);
            setPagination(prev => ({
              ...prev,
              pageNumber: 0, // Resetear página actual
              totalElements: response.data.data.totalElements || 0,
              totalPages: response.data.data.totalPages || 0
            }));
          }
        } catch (error) {
          console.error('Error searching users:', error);
          toast.error('Error al buscar usuarios');
          // Mantener los usuarios actuales en caso de error
        } finally {
          setIsLoading(false);
        }
      }, 500); // Aumentado a 500ms para mejor desempeño
    } else if (value.trim() === '') {
      // Si el término de búsqueda está vacío, recargar usuarios normalmente
      loadUsers();
    }
  }, [pagination.pageSize, selectedRole, selectedStatus, sortConfig, loadUsers]);


  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <UserCog className="h-6 w-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New User
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md"
          />
        </div>

        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="ALL">All Roles</option>
          <option value="VETERINARIO">Veterinarian</option>
          <option value="RECEPCIONISTA">Receptionist</option>
          <option value="CLIENTE">Client</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.uid}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.nombre} {user.apellido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.telefono}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{user.roles[0]}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                              {user.active ? 'Active' : 'Inactive'}
                          </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                              <button
                                  onClick={() => {
                                      setSelectedUser(user);
                                      setIsEditModalOpen(true);
                                  }}
                                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              >
                                  Edit
                              </button>
                              <button
                                  onClick={() => handleToggleStatus(user.uid, user.active)}
                                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                              >
                                  {user.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                  onClick={() => handleDeleteUser(user.uid)}
                                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              >
                                  Delete
                              </button>
                          </div>
                      </td>
                  </tr>
              ))
                      )}
                  </tbody>
              </table>

              {/* Pagination */}
              {/* Paginación */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                      {/* Versión móvil */}
                      <button
                          onClick={() => handlePageChange(pagination.pageNumber - 1)}
                          disabled={pagination.pageNumber === 0}
                          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                          Previous
                      </button>
                      <button
                          onClick={() => handlePageChange(pagination.pageNumber + 1)}
                          disabled={pagination.pageNumber === pagination.totalPages - 1}
                          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                      >
                          Next
                      </button>
                  </div>

                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                      {/* Información de resultados */}
                      <div>
                          <p className="text-sm text-gray-700">
                              Showing{' '}
                              <span className="font-medium">
                                  {pagination.pageNumber * pagination.pageSize + 1}
                              </span>
                              {' '}-{' '}
                              <span className="font-medium">
                                  {Math.min(
                                      (pagination.pageNumber + 1) * pagination.pageSize,
                                      pagination.totalElements
                                  )}
                              </span>
                              {' '}of{' '}
                              <span className="font-medium">{pagination.totalElements}</span>
                              {' '}results
                          </p>
                      </div>

                      {/* Números de página */}
                      <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                              {/* Botón Previous */}
                              <button
                                  onClick={() => handlePageChange(pagination.pageNumber - 1)}
                                  disabled={pagination.pageNumber === 0}
                                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                              >
                                  <span className="sr-only">Previous</span>
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                  </svg>
                              </button>

                              {/* Números de página */}
                              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, index) => {
                                  let pageNumber;

                                  // Lógica para mostrar las páginas más relevantes
                                  if (pagination.totalPages <= 5) {
                                      pageNumber = index;
                                  } else if (pagination.pageNumber < 3) {
                                      pageNumber = index;
                                  } else if (pagination.pageNumber > pagination.totalPages - 4) {
                                      pageNumber = pagination.totalPages - 5 + index;
                                  } else {
                                      pageNumber = pagination.pageNumber - 2 + index;
                                  }

                                  return (
                                      <button
                                          key={pageNumber}
                                          onClick={() => handlePageChange(pageNumber)}
                                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold
                ${pagination.pageNumber === pageNumber
                                                  ? 'z-10 bg-purple-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
                                                  : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                              }`}
                                      >
                                          {pageNumber + 1}
                                      </button>
                                  );
                              })}

                              {/* Botón Next */}
                              <button
                                  onClick={() => handlePageChange(pagination.pageNumber + 1)}
                                  disabled={pagination.pageNumber === pagination.totalPages - 1}
                                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                              >
                                  <span className="sr-only">Next</span>
                                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                  </svg>
                              </button>
                          </nav>
                      </div>
                  </div>
              </div>
          </div>

          {/* Modales */}
          <Modal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              title="Create New User"
          >
        <UserForm
          onSubmit={handleCreateUser}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit User"
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleUpdateUser}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default UserManagement;
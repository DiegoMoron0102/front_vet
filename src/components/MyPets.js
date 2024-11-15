import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({ name: '', species: '', breed: '', age: '' });
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);
  

  const { user } = useAuth();
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [veterinarians, setVeterinarians] = useState([]);
  const [selectedVeterinarian, setSelectedVeterinarian] = useState(null);
  const initialAppointmentData = {
    appointmentDate: format(new Date(), 'yyyy-MM-dd'),
    appointmentTime: '09:00',
    reason: '',
    notes: ''
  };
  const [appointmentData, setAppointmentData] = useState(initialAppointmentData);
  const handleReasonChange = (e) => {
    setAppointmentData(prev => ({ ...prev, reason: e.target.value }));
  };
  
  const handleNotesChange = (e) => {
    setAppointmentData(prev => ({ ...prev, notes: e.target.value }));
  };

  useEffect(() => {
    if (isAddModalOpen || isEditModalOpen) {
      inputRef.current?.focus();  // Enfocar el campo de nombre al abrir el modal
    }
  }, [isAddModalOpen, isEditModalOpen]);
  
  
  
  const loadVeterinarians = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/users/veterinarians', {
        headers: { Authorization: `Bearer ${authService.getToken()}` },
        params: {
          page: 0,
          size: 10,
          sortBy: 'nombre',
          sortDirection: 'ASC'
        }
      });
      
      if (response.data.success) {
        setVeterinarians(response.data.data.content);
      } else {
        toast.error('No se pudieron cargar los veterinarios');
      }
    } catch (error) {
      console.error('Error loading veterinarians:', error);
      toast.error(error.response?.data?.error?.message || 'Error al cargar la lista de veterinarios');
    }
  };

  // Función para agendar cita
  const handleScheduleAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentDateTime = new Date(
        `${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`
      );
  
      const scheduleData = {
        petId: selectedPet.id,
        clientId: user.uid,
        veterinarianId: selectedVeterinarian.uid,
        appointmentDate: appointmentDateTime.toISOString(),
        reason: reason,
        notes: notes
      };
  
      const response = await axios.post(
        'http://localhost:8080/api/appointments/schedule',
        scheduleData,
        {
          headers: { Authorization: `Bearer ${authService.getToken()}` }
        }
      );
  
      if (response.data.success) {
        toast.success('Cita agendada exitosamente');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Error al agendar la cita');
    }
  };


  useEffect(() => {
    const loadUserPets = async () => {
      setIsLoading(true);
      const token = authService.getToken();
      if (!token) {
        toast.error("No se encontró el token de autenticación.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:8080/api/pets/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setPets(response.data.data);
        } else {
          setError('No se encontraron mascotas para este usuario.');
        }
      } catch (error) {
        console.error('Error al cargar mascotas:', error);
        setError('Error al cargar las mascotas del usuario');
      } finally {
        setIsLoading(false);
      }
    };
    loadUserPets();
  }, []);

  const handleViewHistory = (petId) => {
    navigate(`/pets/${petId}/history`);
  };

  const handleAddPet = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const response = await axios.post(`http://localhost:8080/api/pets`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPets([...pets, response.data.data]);
        toast.success('Mascota agregada exitosamente');
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error al agregar mascota:', error);
      toast.error('Error al agregar la mascota');
    }
  };

  const handleEditPet = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const response = await axios.put(`http://localhost:8080/api/pets/${selectedPet.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setPets(pets.map((pet) => (pet.id === selectedPet.id ? response.data.data : pet)));
        toast.success('Mascota editada exitosamente');
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Error al editar mascota:', error);
      toast.error('Error al editar la mascota');
    }
  };

  const openEditModal = (pet) => {
    setSelectedPet(pet);
    setFormData({ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age });
    setIsEditModalOpen(true);
  };
  const renderPetCard = (pet) => (
    <div key={pet.id} className="bg-white rounded-lg border shadow-sm p-4">
      <h4 className="text-lg font-semibold text-gray-900">{pet.name}</h4>
      <p className="text-sm text-gray-500">
        {pet.species} ({pet.breed}) - {pet.age} años
      </p>
      <div className="mt-4 space-y-2">
        <button
          onClick={() => handleViewHistory(pet.id)}
          className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-md"
        >
          Ver Historial
        </button>
        <button
          onClick={() => {
            setSelectedPet(pet);
            loadVeterinarians();
            setIsSchedulingModalOpen(true);
          }}
          className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-md"
        >
          Agendar Cita
        </button>
        <button
          onClick={() => openEditModal(pet)}
          className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md"
        >
          Editar
        </button>
      </div>
    </div>
  );

  // Modal para agendar cita
  const SchedulingModal = () => (
    <Modal
      isOpen={isSchedulingModalOpen}
      onClose={handleCloseModal}
      title={`Agendar Cita para ${selectedPet?.name}`}
    >
      <div className="w-full max-w-lg">
        {/* Primero mostrar la tabla de veterinarios si no hay uno seleccionado */}
        {!selectedVeterinarian ? (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4">Seleccione un veterinario</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {veterinarians.map((vet) => (
                    <tr key={vet.uid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vet.nombre} {vet.apellido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {vet.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedVeterinarian(vet)}
                          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-md"
                        >
                          Seleccionar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Mostrar el formulario de cita si ya hay un veterinario seleccionado
          <form onSubmit={handleScheduleAppointment} className="space-y-6">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Veterinario seleccionado: {selectedVeterinarian.nombre} {selectedVeterinarian.apellido}
              </p>
              <button
                type="button"
                onClick={() => setSelectedVeterinarian(null)}
                className="text-sm text-purple-600 hover:text-purple-700"
              >
                Cambiar veterinario
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  value={appointmentData.appointmentDate}
                  onChange={(e) => setAppointmentData(prev => ({
                    ...prev,
                    appointmentDate: e.target.value
                  }))}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora
                </label>
                <input
                  type="time"
                  value={appointmentData.appointmentTime}
                  onChange={(e) => setAppointmentData(prev => ({
                    ...prev,
                    appointmentTime: e.target.value
                  }))}
                  min="09:00"
                  max="18:00"
                  step="1800"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de la consulta
                </label>
                <textarea
                  value={appointmentData.reason}
                  onChange={handleReasonChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  placeholder="Describa el motivo de la consulta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={appointmentData.notes}
                  onChange={handleNotesChange}
                  rows="3"
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Información adicional relevante"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
              >
                Agendar Cita
              </button>
              </div>
          </form>
        )}
      </div>
    </Modal>
  );
  const handleCloseModal = () => {
    setIsSchedulingModalOpen(false);
    setSelectedVeterinarian(null);
    setReason('');
    setNotes('');
    setAppointmentData(initialAppointmentData);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Pets</h2>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        onClick={() => {
          setFormData({ name: '', species: '', breed: '', age: '' });
          setIsAddModalOpen(true);
        }}
      >
        Agregar Mascota
      </button>
      
      {isLoading ? (
        <p className="text-gray-500">Cargando mascotas...</p>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {pets.map(renderPetCard)}
        </div>
      )}

      {/* Modal para agregar mascota */}
      <Modal isOpen={isAddModalOpen} title="Agregar Mascota" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleAddPet}>
          <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre" required />
          <input value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} placeholder="Especie" required />
          <input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="Raza" required />
          <input value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Edad" type="number" required />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md">Guardar</button>
        </form>
      </Modal>

      {/* Modal para editar mascota */}
      <Modal isOpen={isEditModalOpen} title="Editar Mascota" onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleEditPet}>
          <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Nombre" required />
          <input value={formData.species} onChange={(e) => setFormData({ ...formData, species: e.target.value })} placeholder="Especie" required />
          <input value={formData.breed} onChange={(e) => setFormData({ ...formData, breed: e.target.value })} placeholder="Raza" required />
          <input value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} placeholder="Edad" type="number" required />
          <button type="submit" className="bg-yellow-600 text-white px-4 py-2 rounded-md">Actualizar</button>
        </form>
      </Modal>
      <SchedulingModal />
    </div>
  );
};

export default MyPets;
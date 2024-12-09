import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';
import ScheduleAppointment from '../components/ScheduleAppointment';
import { useAuth } from '../context/AuthContext';
import { Calendar, Clock, PlusCircle } from 'lucide-react';

const MyPets = () => {
  // Estados para gestión de mascotas
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [formData, setFormData] = useState({ name: '', species: '', breed: '', age: '' });
  
  // Estados para programación de citas
  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const { user } = useAuth();

  // Cargar mascotas del usuario
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

  // Manejadores de mascotas
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

  // Manejadores de navegación y visualización
  const handleViewHistory = (petId) => {
    navigate(`/pets/${petId}/history`);
  };

  const handleScheduleAppointment = (pet) => {
    setSelectedPet(pet);
    setIsSchedulingModalOpen(true);
  };

  const handleSchedulingSuccess = () => {
    setIsSchedulingModalOpen(false);
    toast.success('Cita agendada exitosamente');
  };

  // Renderizado de tarjeta de mascota
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
          <Clock className="w-4 h-4 mr-2 inline" />
          Ver Historial
        </button>
        <button
          onClick={() => handleScheduleAppointment(pet)}
          className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-md"
        >
          <Calendar className="w-4 h-4 mr-2 inline" />
          Agendar Cita
        </button>
        <button
          onClick={() => openEditModal(pet)}
          className="w-full px-4 py-2 bg-yellow-100 text-yellow-700 rounded-md"
        >
          <PlusCircle className="w-4 h-4 mr-2 inline" />
          Editar
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Mascotas</h2>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          onClick={() => {
            setFormData({ name: '', species: '', breed: '', age: '' });
            setIsAddModalOpen(true);
          }}
        >
          Agregar Mascota
        </button>
      </div>

      {isLoading ? (
        <p className="text-gray-500">Cargando mascotas...</p>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pets.map(renderPetCard)}
        </div>
      )}

      {/* Modal para agregar mascota */}
      <Modal isOpen={isAddModalOpen} title="Agregar Mascota" onClose={() => setIsAddModalOpen(false)}>
        <form onSubmit={handleAddPet} className="space-y-4">
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            placeholder="Especie"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            placeholder="Raza"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Edad"
            type="number"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <button type="submit" className="w-full px-4 py-2 bg-green-600 text-white rounded-md">
            Guardar
          </button>
        </form>
      </Modal>

      {/* Modal para editar mascota */}
      <Modal isOpen={isEditModalOpen} title="Editar Mascota" onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleEditPet} className="space-y-4">
          <input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Nombre"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            value={formData.species}
            onChange={(e) => setFormData({ ...formData, species: e.target.value })}
            placeholder="Especie"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            placeholder="Raza"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <input
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            placeholder="Edad"
            type="number"
            className="w-full px-3 py-2 border rounded-md"
            required
          />
          <button type="submit" className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md">
            Actualizar
          </button>
        </form>
      </Modal>

      {/* Modal de agendamiento */}
      {isSchedulingModalOpen && selectedPet && (
        <Modal
          isOpen={isSchedulingModalOpen}
          onClose={() => setIsSchedulingModalOpen(false)}
          title={`Agendar Cita para ${selectedPet.name}`}
        >
          <ScheduleAppointment
            petId={selectedPet.id}
            clientId={user.uid}
            onSuccess={handleSchedulingSuccess}
            onCancel={() => setIsSchedulingModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default MyPets;
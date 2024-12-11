import React, { useEffect, useState } from 'react';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';
import Modal from '../components/common/Modal';

const ClientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');

  // Cargar citas del cliente
  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(
        '/client/appointments?page=0&size=10&sortBy=appointmentDate&sortDirection=ASC'
      );
      if (response.data.success) {
        setAppointments(response.data.data.content);
      } else {
        toast.error('Error al cargar las citas');
      }
    } catch (error) {
      console.error('Error al cargar citas:', error);
      toast.error(error.response?.data?.error?.message || 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar una cita
  const handleCancelAppointment = async (appointmentId) => {
    try {
      const response = await axiosInstance.post(`/client/appointments/${appointmentId}/cancel`);
      if (response.data.success) {
        toast.success('Cita cancelada exitosamente');
        loadAppointments();
      } else {
        toast.error('No se pudo cancelar la cita');
      }
    } catch (error) {
      console.error('Error al cancelar cita:', error);
      toast.error(error.response?.data?.error?.message || 'Error desconocido');
    }
  };

  const handleRescheduleAppointment = async (e) => {
    e.preventDefault();
  
    // Validar campos
    if (!newDate || !newTime) {
      toast.error("Por favor, selecciona una nueva fecha y hora.");
      return;
    }
  
    if (!reason.trim()) {
      toast.error("El motivo no puede estar vacío.");
      return;
    }
  
    // Crear el objeto de datos a enviar
    const selectedDateTime = new Date(`${newDate}T${newTime}`).toISOString();
    const payload = {
      newDate: selectedDateTime,
      reason: reason.trim(),
    };
  
    try {
      const response = await axiosInstance.post(
        `/client/appointments/${selectedAppointment.id}/reschedule`,
        payload
      );
  
      if (response.data.success) {
        toast.success("Cita reprogramada exitosamente.");
        handleCloseModal();
        loadAppointments();
      } else {
        toast.error("No se pudo reprogramar la cita.");
      }
    } catch (error) {
      console.error("Error al reprogramar cita:", error);
      toast.error(error.response?.data?.message || "Error desconocido.");
    }
  };
  
  
  

  const handleCloseModal = () => {
    setIsRescheduleModalOpen(false);
    setSelectedAppointment(null);
    setNewDate('');
    setNewTime('');
    setReason('');
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const renderAppointmentCard = (appointment) => (
    <div key={appointment.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
      <h3 className="text-lg font-semibold">{appointment.pet.name}</h3>
      <p>
        Fecha: {new Date(appointment.appointmentDate).toLocaleDateString()}{' '}
        {new Date(appointment.appointmentDate).toLocaleTimeString()}
      </p>
      <p>Motivo: {appointment.reason}</p>
      <p>Veterinario: {appointment.veterinarianName}</p>
      {appointment.status === 'CANCELLED' ? (
        <p className="text-red-600 font-bold mt-4">CANCELADO</p>
      ) : (
        <div className="flex space-x-4 mt-4">
          {appointment.canCancel && (
            <button
              onClick={() => handleCancelAppointment(appointment.id)}
              className="px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Cancelar
            </button>
          )}
          {appointment.canReschedule && (
            <button
              onClick={() => {
                setSelectedAppointment(appointment);
                setIsRescheduleModalOpen(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Reprogramar
            </button>
          )}
        </div>
      )}
    </div>
  );


  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mis Citas</h2>
      {isLoading ? (
        <p>Cargando citas...</p>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div>{appointments.map(renderAppointmentCard)}</div>
      )}

      {/* Modal para reprogramar cita */}
      <Modal isOpen={isRescheduleModalOpen} onClose={handleCloseModal} title="Reprogramar Cita">
        <form onSubmit={handleRescheduleAppointment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva Fecha</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nueva Hora</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Motivo para reprogramar la cita"
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md">
              Reprogramar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientAppointments;

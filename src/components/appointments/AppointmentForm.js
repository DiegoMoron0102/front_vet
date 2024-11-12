import React, { useState } from 'react';
import { format } from 'date-fns';

const AppointmentForm = ({ selectedVeterinarian, onSubmit, onBack }) => {
  const [formData, setFormData] = useState({
    appointmentDate: format(new Date(), 'yyyy-MM-dd'),
    appointmentTime: '09:00',
    reason: '',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">
          Veterinario seleccionado: {selectedVeterinarian.nombre} {selectedVeterinarian.apellido}
        </p>
        <button
          type="button"
          onClick={onBack}
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
            value={formData.appointmentDate}
            onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
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
            value={formData.appointmentTime}
            onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
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
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          rows="3"
          className="w-full px-3 py-2 border rounded-md"
          required
          placeholder="Describa el motivo de la consulta"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas adicionales (opcional)
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows="3"
          className="w-full px-3 py-2 border rounded-md"
          placeholder="Información adicional relevante"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onBack}
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
  );
};
export default AppointmentForm;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/axios';
import toast from 'react-hot-toast';


const AddMedicalRecord = () => {
  const { petId } = useParams();
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const navigate = useNavigate();
  const [favoriteIds, setFavoriteIds] = useState([]); // Estado para favoritos
  const [formData, setFormData] = useState({
    motivoConsulta: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Obtener servicios por categoría
        const response = await axiosInstance.get('/services/by-category');
        const servicesData = response.data.data.servicesByCategory || {};

        // Obtener favoritos del veterinario
        const favoritesResponse = await axiosInstance.get('/favorites');
        const favoriteServices = favoritesResponse.data.data || [];
        const favoriteIdsList = favoriteServices
          .filter((item) => item.itemType === 'VETERINARY_SERVICE')
          .map((item) => item.itemId);

        setFavoriteIds(favoriteIdsList); // Guardar favoritos en el estado

        // Ordenar servicios: favoritos primero
        const sortedServicesByCategory = {};
        Object.keys(servicesData).forEach((category) => {
          const services = servicesData[category];
          const favorites = services.filter((service) => favoriteIdsList.includes(service.id));
          const others = services.filter((service) => !favoriteIdsList.includes(service.id));
          sortedServicesByCategory[category] = [...favorites, ...others];
        });

        setServicesByCategory(sortedServicesByCategory);
      } catch (error) {
        console.error('Error al cargar servicios:', error);
        toast.error('No se pudo cargar la lista de servicios.');
      }
    };

    fetchServices();
  }, []);

  // Toggle service selection
  const toggleServiceSelection = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.serviceId === service.id);
      if (exists) {
        return prev.filter((s) => s.serviceId !== service.id);
      } else {
        return [
          ...prev,
          {
            serviceId: service.id,
            precioPersonalizado: service.price, // Default price
            notas: '',
          },
        ];
      }
    });
  };

  // Update custom price
  const updateCustomPrice = (serviceId, price) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.serviceId === serviceId ? { ...s, precioPersonalizado: price } : s
      )
    );
  };

  // Update notes
  const updateNotes = (serviceId, notes) => {
    setSelectedServices((prev) =>
      prev.map((s) =>
        s.serviceId === serviceId ? { ...s, notas: notes } : s
      )
    );
  };

  // Handle save medical record
  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        serviciosRealizados: selectedServices,
      };
  
      const response = await axiosInstance.post(`/historial-clinico/mascota/${petId}`, payload);
  
      if (response.data.success) {
        toast.success('Historial médico registrado exitosamente.');
        navigate(`/pets/${petId}/history`); // Redirige al historial de la mascota
      } else {
        toast.error('Error al guardar el historial médico.');
      }
    } catch (error) {
      console.error('Error al guardar el historial médico:', error);
      toast.error('No se pudo registrar el historial médico.');
    }
  };
  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agregar Historial Médico</h1>

      {/* Formulario básico */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Motivo de Consulta</label>
          <input
            type="text"
            className="w-full px-3 py-2 border rounded"
            value={formData.motivoConsulta}
            onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Diagnóstico</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            value={formData.diagnostico}
            onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium">Tratamiento</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            value={formData.tratamiento}
            onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium">Observaciones</label>
          <textarea
            className="w-full px-3 py-2 border rounded"
            value={formData.observaciones}
            onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
          ></textarea>
        </div>
      </div>

      {/* Lista de servicios */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Servicios Disponibles</h2>
        {Object.keys(servicesByCategory).map((category) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-bold">{category}</h3>
            <ul>
              {servicesByCategory[category].map((service) => (
                <li key={service.id} className="flex items-center space-x-4 mt-2">
                  <input
                    type="checkbox"
                    id={`service-${service.id}`}
                    onChange={() => toggleServiceSelection(service)}
                    checked={!!selectedServices.find((s) => s.serviceId === service.id)}
                  />
                  <label htmlFor={`service-${service.id}`} className="flex-grow">
                    {service.name} - ${service.price}
                    {favoriteIds.includes(service.id) && (
                      <span className="text-red-500 font-semibold ml-2">(Favorito)</span>
                    )}
                  </label>

                  <input
                    type="number"
                    placeholder="Precio personalizado"
                    className="w-24 px-2 py-1 border rounded"
                    onChange={(e) => updateCustomPrice(service.id, e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Notas"
                    className="w-48 px-2 py-1 border rounded"
                    onChange={(e) => updateNotes(service.id, e.target.value)}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Botón para guardar */}
      <button
        onClick={handleSave}
        className="px-6 py-2 bg-blue-600 text-white rounded mt-6"
      >
        Guardar Historial Médico
      </button>
    </div>
  );
};

export default AddMedicalRecord;

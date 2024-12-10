import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../config/axios';
import toast from 'react-hot-toast';

const ServiceForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationMinutes: '',
    category: '',
    requirements: [''],
    recommendations: [''],
    warnings: [''],
  });

  const [categories, setCategories] = useState([]);
  const { id } = useParams(); // Obtener el parámetro de la URL
  const navigate = useNavigate();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await axios.get('/services/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        } else {
          toast.error('Error al cargar las categorías');
        }
      } catch (error) {
        console.error('Error cargando categorías:', error);
        toast.error('Error al cargar las categorías');
      }
    };

    const loadServiceDetails = async () => {
      if (!id) return; // Si no hay ID, es una creación de servicio
      try {
        const response = await axios.get(`/services/${id}`);
        if (response.data.success) {
          const service = response.data.data;
          setFormData({
            name: service.name,
            description: service.description,
            price: service.price,
            durationMinutes: service.durationMinutes,
            category: service.category,
            requirements: service.requirements || [''],
            recommendations: service.recommendations || [''],
            warnings: service.warnings || [''],
          });
        } else {
          toast.error('Error al cargar los detalles del servicio');
        }
      } catch (error) {
        console.error('Error cargando servicio:', error);
        toast.error('Error al cargar los detalles del servicio');
      }
    };

    loadCategories();
    loadServiceDetails();
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData((prev) => ({ ...prev, [field]: newArray }));
  };

  const handleArrayAdd = (field) => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        // Edición
        await axios.put(`/services/${id}`, formData);
        toast.success('Servicio actualizado exitosamente');
      } else {
        // Creación
        await axios.post('/services', formData);
        toast.success('Servicio creado exitosamente');
      }
      navigate('/admin/services');
    } catch (error) {
      console.error('Error al guardar el servicio:', error);
      toast.error('Error al guardar el servicio');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{id ? 'Editar Servicio' : 'Agregar Servicio'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <textarea
          placeholder="Descripción"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Precio"
          value={formData.price}
          onChange={(e) => handleInputChange('price', e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Duración (min)"
          value={formData.durationMinutes}
          onChange={(e) => handleInputChange('durationMinutes', e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <select
          value={formData.category}
          onChange={(e) => handleInputChange('category', e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        >
          <option value="">Selecciona una categoría</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {['requirements', 'recommendations', 'warnings'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium capitalize">{field}</label>
            {formData[field].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleArrayChange(field, index, e.target.value)}
                  className="w-full px-4 py-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => handleArrayRemove(field, index)}
                  className="text-red-500"
                >
                  Eliminar
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleArrayAdd(field)}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Añadir {field.slice(0, -1)}
            </button>
          </div>
        ))}

        <div className="flex space-x-4">
          <button type="submit" className="px-6 py-2 bg-green-500 text-white rounded">
            Guardar
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/services')}
            className="px-6 py-2 bg-gray-300 text-black rounded"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceForm;

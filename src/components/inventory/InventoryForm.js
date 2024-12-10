// components/inventory/InventoryForm.js
import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const InventoryForm = ({ initialData, onSubmit, onCancel }) => {
  // Esquema de validación
  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('El nombre es requerido')
      .min(2, 'El nombre debe tener al menos 2 caracteres'),
    quantity: Yup.number()
      .required('La cantidad es requerida')
      .min(0, 'La cantidad no puede ser negativa'),
    minThreshold: Yup.number()
      .required('El umbral mínimo es requerido')
      .min(0, 'El umbral mínimo no puede ser negativo'),
    price: Yup.number()
      .required('El precio es requerido')
      .min(0, 'El precio no puede ser negativo'),
    recommendedOrderQuantity: Yup.number()
      .min(0, 'La cantidad recomendada no puede ser negativa')
  });

  // Configuración de Formik
  const formik = useFormik({
    initialValues: {
      name: initialData?.name || '',
      quantity: initialData?.quantity || '',
      minThreshold: initialData?.minThreshold || '',
      price: initialData?.price || '',
      recommendedOrderQuantity: initialData?.recommendedOrderQuantity || ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        formik.setStatus({ error: error.message });
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6 w-full">
      {/* Nombre del producto */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nombre del producto
        </label>
        <input
          type="text"
          name="name"
          {...formik.getFieldProps('name')}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            ${formik.touched.name && formik.errors.name ? 'border-red-300' : 'border-gray-300'}
            focus:ring-purple-500 focus:border-purple-500`}
          disabled={initialData ? true : false}
        />
        {formik.touched.name && formik.errors.name && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.name}</p>
        )}
      </div>

      {/* Cantidad */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad
        </label>
        <input
          type="number"
          name="quantity"
          {...formik.getFieldProps('quantity')}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            ${formik.touched.quantity && formik.errors.quantity ? 'border-red-300' : 'border-gray-300'}
            focus:ring-purple-500 focus:border-purple-500`}
        />
        {formik.touched.quantity && formik.errors.quantity && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.quantity}</p>
        )}
      </div>

      {/* Umbral mínimo */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Umbral mínimo
        </label>
        <input
          type="number"
          name="minThreshold"
          {...formik.getFieldProps('minThreshold')}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            ${formik.touched.minThreshold && formik.errors.minThreshold ? 'border-red-300' : 'border-gray-300'}
            focus:ring-purple-500 focus:border-purple-500`}
        />
        {formik.touched.minThreshold && formik.errors.minThreshold && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.minThreshold}</p>
        )}
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Precio
        </label>
        <input
          type="number"
          name="price"
          step="0.01"
          {...formik.getFieldProps('price')}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            ${formik.touched.price && formik.errors.price ? 'border-red-300' : 'border-gray-300'}
            focus:ring-purple-500 focus:border-purple-500`}
        />
        {formik.touched.price && formik.errors.price && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.price}</p>
        )}
      </div>

      {/* Cantidad recomendada de pedido */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad recomendada de pedido
        </label>
        <input
          type="number"
          name="recommendedOrderQuantity"
          {...formik.getFieldProps('recommendedOrderQuantity')}
          className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm
            ${formik.touched.recommendedOrderQuantity && formik.errors.recommendedOrderQuantity ? 'border-red-300' : 'border-gray-300'}
            focus:ring-purple-500 focus:border-purple-500`}
        />
        {formik.touched.recommendedOrderQuantity && formik.errors.recommendedOrderQuantity && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.recommendedOrderQuantity}</p>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
        >
          {initialData ? 'Actualizar' : 'Guardar'}
        </button>
      </div>

      {/* Mensaje de error */}
      {formik.status?.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{formik.status.error}</p>
        </div>
      )}
    </form>
  );
};

export default InventoryForm;
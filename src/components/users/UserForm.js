import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const UserForm = ({ user, onSubmit, onCancel }) => {
  // Esquema de validación corregido
  const validationSchema = Yup.object().shape({
    nombre: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters'),
    apellido: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    telefono: Yup.string()
      .required('Phone number is required')
      .matches(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    roles: Yup.array()
      .min(1, 'At least one role is required')
      .required('Role is required'),
    // Validación condicional corregida para password
    password: Yup.string().when('isNewUser', (isNewUser, schema) => {
      return isNewUser ? 
        schema.required('Password is required').min(6, 'Password must be at least 6 characters') :
        schema.notRequired();
    })
  });

  const formik = useFormik({
    initialValues: {
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      email: user?.email || '',
      telefono: user?.telefono || '',
      roles: user?.roles || ['CLIENTE'],
      password: '',
      isNewUser: !user // Flag para determinar si es un nuevo usuario
    },
    validationSchema,
    onSubmit: async (values) => {
      // Remover el flag isNewUser antes de enviar
      const { isNewUser, ...submitData } = values;
      try {
        await onSubmit(submitData);
      } catch (error) {
        formik.setStatus({ error: error.message });
      }
    }
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6 w-full min-w-[500px]">
      {/* Nombre */}
      <div className="space-y-2">
        <label className="block text-base font-medium text-gray-700">
          Name
        </label>
        <input
          type="text"
          name="nombre"
          placeholder="Enter name"
          {...formik.getFieldProps('nombre')}
          className={`
            mt-1 block w-full px-4 py-3 rounded-md 
            border border-gray-300 shadow-sm
            text-base placeholder:text-gray-400
            focus:border-purple-500 focus:ring-2 focus:ring-purple-500 
            ${formik.touched.nombre && formik.errors.nombre ? 'border-red-300' : ''}
          `}
        />
        {formik.touched.nombre && formik.errors.nombre && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.nombre}</p>
        )}
      </div>

      {/* Apellido */}
      <div className="space-y-2">
        <label className="block text-base font-medium text-gray-700">
          Last Name
        </label>
        <input
          type="text"
          name="apellido"
          placeholder="Enter last name"
          {...formik.getFieldProps('apellido')}
          className={`
            mt-1 block w-full px-4 py-3 rounded-md 
            border border-gray-300 shadow-sm
            text-base placeholder:text-gray-400
            focus:border-purple-500 focus:ring-2 focus:ring-purple-500 
            ${formik.touched.apellido && formik.errors.apellido ? 'border-red-300' : ''}
          `}
        />
        {formik.touched.apellido && formik.errors.apellido && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.apellido}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-base font-medium text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="example@email.com"
          {...formik.getFieldProps('email')}
          className={`
            mt-1 block w-full px-4 py-3 rounded-md 
            border border-gray-300 shadow-sm
            text-base placeholder:text-gray-400
            focus:border-purple-500 focus:ring-2 focus:ring-purple-500 
            ${formik.touched.email && formik.errors.email ? 'border-red-300' : ''}
          `}
        />
        {formik.touched.email && formik.errors.email && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
        )}
      </div>

      {/* Password (solo para nuevos usuarios) */}
      {!user && (
        <div className="space-y-2">
          <label className="block text-base font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            {...formik.getFieldProps('password')}
            className={`
              mt-1 block w-full px-4 py-3 rounded-md 
              border border-gray-300 shadow-sm
              text-base placeholder:text-gray-400
              focus:border-purple-500 focus:ring-2 focus:ring-purple-500 
              ${formik.touched.password && formik.errors.password ? 'border-red-300' : ''}
            `}
          />
          {formik.touched.password && formik.errors.password && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
          )}
        </div>
      )}

      {/* Teléfono */}
      <div className="space-y-2">
        <label className="block text-base font-medium text-gray-700">
          Phone
        </label>
        <input
          type="tel"
          name="telefono"
          placeholder="Enter phone number"
          {...formik.getFieldProps('telefono')}
          className={`
            mt-1 block w-full px-4 py-3 rounded-md 
            border border-gray-300 shadow-sm
            text-base placeholder:text-gray-400
            focus:border-purple-500 focus:ring-2 focus:ring-purple-500 
            ${formik.touched.telefono && formik.errors.telefono ? 'border-red-300' : ''}
          `}
        />
        {formik.touched.telefono && formik.errors.telefono && (
          <p className="mt-1 text-sm text-red-600">{formik.errors.telefono}</p>
        )}
      </div>

      {/* Roles */}
      <div className="space-y-2">
        <label className="block text-base font-medium text-gray-700">
          Role
        </label>
        <select
          name="roles"
          value={formik.values.roles[0]}
          onChange={(e) => formik.setFieldValue('roles', [e.target.value])}
          className="
            mt-1 block w-full px-4 py-3 rounded-md 
            border border-gray-300 shadow-sm
            text-base bg-white
            focus:border-purple-500 focus:ring-2 focus:ring-purple-500
          "
        >
          <option value="CLIENTE">Client</option>
          <option value="RECEPCIONISTA">Receptionist</option>
          <option value="VETERINARIO">Veterinarian</option>
        </select>
      </div>

      {/* Botones */}
      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="
            px-6 py-3 border border-gray-300 rounded-md
            text-base font-medium text-gray-700
            hover:bg-gray-50 transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
          "
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="
            px-6 py-3 border border-transparent rounded-md
            text-base font-medium text-white
            bg-purple-600 hover:bg-purple-700
            transition-colors
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {user ? 'Update' : 'Create'}
        </button>
      </div>

      {/* Mensaje de error general */}
      {formik.status?.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{formik.status.error}</p>
        </div>
      )}
    </form>
  );
};

export default UserForm;
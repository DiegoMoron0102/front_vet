// src/routes/AppRoutes.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import Dashboard from '../components/Dashboard';
import MyProfile from '../components/MyProfile';
import ClientList from '../components/clients/ClientList';
import TodayAppointments from '../components/appointments/TodayAppointments'; // Nueva importación
import InventoryManagement from '../components/InventoryManagement'; // Nueva importación
import UserManagement from '../components/UserManagement';
import MainLayout from '../components/Layout/MainLayout';
import PetMedicalHistory from '../components/PetMedicalHistory';
import { useAuth } from '../context/AuthContext';
import MyPets from '../components/MyPets';
import ServiceList from '../components/ServiceList';
import ServiceManagement from '../components/ServiceManagement';
import ClientAppointments from '../components/ClientAppointments';

// Componente para rutas protegidas
const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si hay roles permitidos definidos, verificar si el usuario tiene acceso
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.roles[0])) {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={
          user ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/register" element={
          user ? <Navigate to="/dashboard" replace /> : <Register />
        } />
        
        {/* Rutas protegidas */}
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        
        {/* Ruta de citas - Solo accesible para VETERINARIO y RECEPCIONISTA */}
        <Route path="/appointments" element={
          <PrivateRoute allowedRoles={['VETERINARIO', 'RECEPCIONISTA']}>
            <TodayAppointments />
          </PrivateRoute>
        } />

        
        
        <Route path="/profile" element={
          <PrivateRoute>
            <MyProfile />
          </PrivateRoute>
        } />
        <Route path="/my-pets" element={
          <PrivateRoute>
            <MyPets />
          </PrivateRoute>} />
        {/* Ruta por defecto */}
        <Route path="/" element={
          <Navigate to="/dashboard" replace />
        } />



        <Route path="/clients" element={
          <PrivateRoute allowedRoles={['VETERINARIO', 'RECEPCIONISTA']}>
            <ClientList />
          </PrivateRoute>
        } />
        <Route path="/inventory" element={
          <PrivateRoute allowedRoles={['VETERINARIO', 'RECEPCIONISTA']}>
            <InventoryManagement />
          </PrivateRoute>
        } />
        <Route path="/user-management" element={
          <PrivateRoute allowedRoles={['VETERINARIO']}>
            <UserManagement />
          </PrivateRoute>
        } />
        <Route
          path="/pets/:petId/history"
          element={
            <PrivateRoute >
              <PetMedicalHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/services"
          element={
            <PrivateRoute>
              <ServiceList />
            </PrivateRoute>
          }
        />
       {/* Ruta de gestión de servicios - Solo accesible para ADMIN */}
        <Route path="/admin/services" element={
          <PrivateRoute allowedRoles={['ADMINISTRADOR']}>
            <ServiceManagement />
          </PrivateRoute>
        } />

        {/* Ruta de citas del cliente - Solo accesible para CLIENTE */}

        <Route path="/my-appointments" element={
          <PrivateRoute allowedRoles={['CLIENTE']}>
            <ClientAppointments />
          </PrivateRoute>
        } />


        

        {/* Ruta 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  HomeIcon, 
  CalendarIcon, 
  UsersIcon, 
  PawPrintIcon,
  PackageIcon,
  UserCogIcon,
  UserIcon,
  LogOutIcon,
  CreditCardIcon
} from 'lucide-react';



// Mapeo de rutas por rol
const roleRoutes = {
  VETERINARIO: [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    { path: '/appointments', name: "Today's Appointments", icon: CalendarIcon },
    { path: '/clients', name: 'Clients', icon: UsersIcon },
    { path: '/pets', name: 'Pets', icon: PawPrintIcon },
    { path: '/inventory', name: 'Inventory', icon: PackageIcon },
    { path: '/user-management', name: 'User Management', icon: UserCogIcon },
    { path: '/profile', name: 'My Profile', icon: UserIcon },
    { path: '/services', name: 'Services', icon: PackageIcon },

  ],
  RECEPCIONISTA: [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    //{ path: '/appointments', name: "Today's Appointments", icon: CalendarIcon },
    { path: '/clients', name: 'Clients', icon: UsersIcon },
    { path: '/pets', name: 'Pets', icon: PawPrintIcon },
    { path: '/inventory', name: 'Inventory', icon: PackageIcon },
    { path: '/profile', name: 'My Profile', icon: UserIcon },
    { path: '/receptionist/appointments', name: "Today's Appointments", icon: CalendarIcon}
  ],
  CLIENTE: [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    //{ path: '/my-appointments', name: 'My Appointments', icon: CalendarIcon },
    { path: '/my-pets', name: 'My Pets-Appointments', icon: PawPrintIcon },
    { path: '/profile', name: 'My Profile', icon: UserIcon },
    { path: '/services', name: 'Services', icon: PackageIcon },
    { path: '/my-appointments', name: "Today's Appointments", icon: CalendarIcon },
    { path: '/payment-history', name: 'Payment History', icon: CreditCardIcon },
  ],
  ADMINISTRADOR: [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon },
    { path: '/clients', name: 'Clients', icon: UsersIcon },
    { path: '/inventory', name: 'Inventory', icon: PackageIcon },
    { path: '/profile', name: 'My Profile', icon: UserIcon },
    { path : '/admin/services', name: 'Services', icon: PackageIcon },
    { path: '/reports/services', name: 'Service Reports', icon: PackageIcon }, // NUEVA RUTA
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  // Obtener las rutas correspondientes al rol del usuario
  const userRoutes = user?.roles?.[0] ? roleRoutes[user.roles[0]] : [];

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <img src="/logo.png" alt="PurplePaw" className="h-8 w-auto" />
          <span className="text-xl font-bold text-gray-900">🐾PurplePaw</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {userRoutes.map((route) => {
          const Icon = route.icon;
          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                location.pathname === route.path
                  ? 'bg-[#C792DF] text-white'
                  : 'text-gray-600 hover:bg-purple-50 hover:text-[#C792DF]'
              }`}
            >
              <Icon className="mr-3 h-5 w-5" />
              {route.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-purple-50 hover:text-[#C792DF]"
        >
          <LogOutIcon className="mr-3 h-5 w-5" />
          Log out
        </button>
      </div>
    </div>
  );
};
export default Sidebar;
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user } = useAuth();

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-800">
        {/* Aquí podrías poner el título de la página actual */}
      </h1>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div className="text-sm">
            <span className="block font-medium text-gray-900">{user?.email}</span>
            <span className="block text-gray-500">{user?.roles?.[0]}</span>
          </div>
          <ChevronDown className="ml-2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
export default Navbar;
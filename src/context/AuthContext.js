import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar si hay una sesión activa al cargar la aplicación
  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      if (currentUser && token) {
        setUser(currentUser);
        setToken(token);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem('token', tokenData);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout,
      isLoading,
      isAuthenticated: !!token
    }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
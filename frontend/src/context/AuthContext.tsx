import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Perdorues, RoleName, AuthResponse } from '../types';
import apiClient from '../config/apiClient';

interface AuthContextType {
  user: Perdorues | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: RoleName) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Perdorues | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Lexo user nga localStorage nëse ekziston
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          setUser(user);
        } catch (error) {
          console.error('Gabim në leximin e user nga localStorage:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post<{ status: string; data: AuthResponse }>('/auth/login', {
        email,
        password,
      });

      if (response.data.status === 'success' && response.data.data) {
        const { token, perdorues } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(perdorues));
        setUser(perdorues);
      } else {
        throw new Error('Format i pasaktë i përgjigjes nga serveri');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Email ose fjalëkalim i pasaktë';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (role: RoleName): boolean => {
    return user?.rolet?.includes(role) || false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth duhet të përdoret brenda AuthProvider');
  }
  return context;
};
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage on mount
    const stored = localStorage.getItem('bac2026_user');
    if (stored) {
      setUser(JSON.parse(stored));
    }
  }, []);

  const login = () => {
    // Simulate Google Login
    const mockUser: User = {
      email: 'eleve@gmail.com',
      name: 'Élève de Première',
      avatar: 'https://ui-avatars.com/api/?name=Eleve+Premiere&background=4f46e5&color=fff'
    };
    localStorage.setItem('bac2026_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  const logout = () => {
    localStorage.removeItem('bac2026_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
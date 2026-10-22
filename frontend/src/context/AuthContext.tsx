/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from 'react';
import { useApolloClient } from '@apollo/client/react';
import type { AuthContextType } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const client = useApolloClient();

  const login = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = async () => {
    localStorage.removeItem('isAuthenticated');
    setIsAuthenticated(false);
    await client.clearStore();
  };

  return (
    <AuthContext.Provider value={{ token: null, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

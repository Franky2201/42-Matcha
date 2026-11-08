/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, type ReactNode } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { LOGOUT_MUTATION } from '../lib/mutations';
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
    try {
      await client.mutate({ mutation: LOGOUT_MUTATION });
    } catch (error) {
      console.error("Erreur serveur lors de la déconnexion", error);
    } finally {
      localStorage.removeItem('isAuthenticated');
      setIsAuthenticated(false);
      await client.clearStore();
    }
  };

  return (
    <AuthContext.Provider value={{ token: null, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

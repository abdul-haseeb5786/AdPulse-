import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { getCurrentUser, isAuthenticated, logout as authLogout } from '../services/authService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

type AuthContextType = {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getCurrentUser());
  const [isAuth, setIsAuth] = useState<boolean>(isAuthenticated());
  const isLoading = false;

  const handleLogout = () => {
    authLogout();
    setUser(null);
    setIsAuth(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuth, isLoading, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

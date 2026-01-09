import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../../types';
import { userService } from '../../services/userService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      userService
        .getCurrentUser()
        .then((user) => {
          setUser(user);
        })
        .catch(() => {
          localStorage.removeItem('jwtToken');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const user = await userService.login(credentials);
    localStorage.setItem('jwtToken', user.token);
    setUser(user);
  };

  const register = async (credentials: { username: string; email: string; password: string }) => {
    const user = await userService.register(credentials);
    localStorage.setItem('jwtToken', user.token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('jwtToken');
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    const updatedUser = await userService.update(userData);
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

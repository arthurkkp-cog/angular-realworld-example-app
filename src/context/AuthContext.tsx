import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import { userService } from '../services/user';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setAuth = useCallback((user: User) => {
    localStorage.setItem('jwtToken', user.token);
    setCurrentUser(user);
  }, []);

  const purgeAuth = useCallback(() => {
    localStorage.removeItem('jwtToken');
    setCurrentUser(null);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (token) {
      userService
        .getCurrentUser()
        .then(({ user }) => {
          setAuth(user);
        })
        .catch(() => {
          purgeAuth();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [setAuth, purgeAuth]);

  const login = async (credentials: { email: string; password: string }) => {
    const { user } = await userService.login(credentials);
    setAuth(user);
  };

  const register = async (credentials: { username: string; email: string; password: string }) => {
    const { user } = await userService.register(credentials);
    setAuth(user);
  };

  const logout = () => {
    purgeAuth();
  };

  const updateUser = async (userData: Partial<User>) => {
    const { user } = await userService.update(userData);
    setCurrentUser(user);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
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

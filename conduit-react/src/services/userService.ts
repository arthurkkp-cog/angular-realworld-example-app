import api from './api';
import { User } from '../types';

export const userService = {
  login: async (credentials: { email: string; password: string }): Promise<User> => {
    const response = await api.post<{ user: User }>('/users/login', { user: credentials });
    return response.data.user;
  },

  register: async (credentials: { username: string; email: string; password: string }): Promise<User> => {
    const response = await api.post<{ user: User }>('/users', { user: credentials });
    return response.data.user;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ user: User }>('/user');
    return response.data.user;
  },

  updateUser: async (user: Partial<User>): Promise<User> => {
    const response = await api.put<{ user: User }>('/user', { user });
    return response.data.user;
  },
};

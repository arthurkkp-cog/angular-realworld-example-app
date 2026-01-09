import { api } from './api';
import { User } from '../types';

export const userService = {
  login: (credentials: { email: string; password: string }): Promise<{ user: User }> =>
    api.post<{ user: User }>('/users/login', { user: credentials }),

  register: (credentials: { username: string; email: string; password: string }): Promise<{ user: User }> =>
    api.post<{ user: User }>('/users', { user: credentials }),

  getCurrentUser: (): Promise<{ user: User }> => api.get<{ user: User }>('/user'),

  update: (user: Partial<User>): Promise<{ user: User }> => api.put<{ user: User }>('/user', { user }),
};

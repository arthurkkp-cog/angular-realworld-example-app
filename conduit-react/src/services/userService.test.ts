import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './userService';
import api from './api';
import { mockUser, createMockAxiosResponse } from '../test/mocks';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should call api.post with correct parameters', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      vi.mocked(api.post).mockResolvedValue(createMockAxiosResponse({ user: mockUser }));

      const result = await userService.login(credentials);

      expect(api.post).toHaveBeenCalledWith('/users/login', { user: credentials });
      expect(result).toEqual(mockUser);
    });

    it('should return user data on successful login', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      vi.mocked(api.post).mockResolvedValue(createMockAxiosResponse({ user: mockUser }));

      const result = await userService.login(credentials);

      expect(result.email).toBe(mockUser.email);
      expect(result.token).toBe(mockUser.token);
      expect(result.username).toBe(mockUser.username);
    });
  });

  describe('register', () => {
    it('should call api.post with correct parameters', async () => {
      const credentials = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      vi.mocked(api.post).mockResolvedValue(createMockAxiosResponse({ user: mockUser }));

      const result = await userService.register(credentials);

      expect(api.post).toHaveBeenCalledWith('/users', { user: credentials });
      expect(result).toEqual(mockUser);
    });

    it('should return user data on successful registration', async () => {
      const credentials = { username: 'testuser', email: 'test@example.com', password: 'password123' };
      vi.mocked(api.post).mockResolvedValue(createMockAxiosResponse({ user: mockUser }));

      const result = await userService.register(credentials);

      expect(result.email).toBe(mockUser.email);
      expect(result.username).toBe(mockUser.username);
    });
  });

  describe('getCurrentUser', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ user: mockUser }));

      const result = await userService.getCurrentUser();

      expect(api.get).toHaveBeenCalledWith('/user');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should call api.put with correct parameters', async () => {
      const userData = { bio: 'Updated bio', image: 'https://new-image.com' };
      vi.mocked(api.put).mockResolvedValue(createMockAxiosResponse({ user: { ...mockUser, ...userData } }));

      const result = await userService.updateUser(userData);

      expect(api.put).toHaveBeenCalledWith('/user', { user: userData });
      expect(result.bio).toBe(userData.bio);
    });
  });
});

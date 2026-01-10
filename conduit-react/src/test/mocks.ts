import { vi } from 'vitest';
import { User, Profile, Article, Comment } from '../types';

export const mockUser: User = {
  email: 'test@example.com',
  token: 'test-token-123',
  username: 'testuser',
  bio: 'Test bio',
  image: 'https://example.com/image.jpg',
};

export const mockProfile: Profile = {
  username: 'testuser',
  bio: 'Test bio',
  image: 'https://example.com/image.jpg',
  following: false,
};

export const mockArticle: Article = {
  slug: 'test-article-slug',
  title: 'Test Article',
  description: 'Test description',
  body: 'Test body content',
  tagList: ['test', 'article'],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  favorited: false,
  favoritesCount: 5,
  author: mockProfile,
};

export const mockComment: Comment = {
  id: '1',
  body: 'Test comment',
  createdAt: '2024-01-01T00:00:00.000Z',
  author: mockProfile,
};

export const createMockAxiosResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {} as never,
});

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

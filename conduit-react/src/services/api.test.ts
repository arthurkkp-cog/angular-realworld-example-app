import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from './api';

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should export api instance', () => {
    expect(api).toBeDefined();
  });

  it('should have correct base URL', () => {
    expect(api.defaults.baseURL).toBe('https://api.realworld.show/api');
  });

  it('should have request interceptors configured', () => {
    expect(api.interceptors.request).toBeDefined();
    expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
  });

  it('should have response interceptors configured', () => {
    expect(api.interceptors.response).toBeDefined();
    expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
  });
});

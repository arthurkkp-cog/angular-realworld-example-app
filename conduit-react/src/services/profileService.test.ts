import { describe, it, expect, vi, beforeEach } from 'vitest';
import { profileService } from './profileService';
import api from './api';
import { mockProfile, createMockAxiosResponse } from '../test/mocks';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should call api.get with correct username', async () => {
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ profile: mockProfile }));

      const result = await profileService.getProfile('testuser');

      expect(api.get).toHaveBeenCalledWith('/profiles/testuser');
      expect(result).toEqual(mockProfile);
    });

    it('should return profile data', async () => {
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ profile: mockProfile }));

      const result = await profileService.getProfile('testuser');

      expect(result.username).toBe('testuser');
      expect(result.bio).toBe('Test bio');
      expect(result.following).toBe(false);
    });
  });

  describe('follow', () => {
    it('should call api.post with correct endpoint', async () => {
      const followingProfile = { ...mockProfile, following: true };
      vi.mocked(api.post).mockResolvedValue(createMockAxiosResponse({ profile: followingProfile }));

      const result = await profileService.follow('testuser');

      expect(api.post).toHaveBeenCalledWith('/profiles/testuser/follow', {});
      expect(result.following).toBe(true);
    });
  });

  describe('unfollow', () => {
    it('should call api.delete with correct endpoint', async () => {
      const unfollowedProfile = { ...mockProfile, following: false };
      vi.mocked(api.delete).mockResolvedValue(createMockAxiosResponse({ profile: unfollowedProfile }));

      const result = await profileService.unfollow('testuser');

      expect(api.delete).toHaveBeenCalledWith('/profiles/testuser/follow');
      expect(result.following).toBe(false);
    });
  });
});

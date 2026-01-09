import api from './api';
import type { Profile } from '../types';

export const profileService = {
  get: async (username: string): Promise<Profile> => {
    const response = await api.get<{ profile: Profile }>(`/profiles/${username}`);
    return response.data.profile;
  },

  follow: async (username: string): Promise<Profile> => {
    const response = await api.post<{ profile: Profile }>(`/profiles/${username}/follow`, {});
    return response.data.profile;
  },

  unfollow: async (username: string): Promise<Profile> => {
    const response = await api.delete<{ profile: Profile }>(`/profiles/${username}/follow`);
    return response.data.profile;
  },
};

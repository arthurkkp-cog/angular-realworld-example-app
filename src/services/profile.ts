import { api } from './api';
import { Profile } from '../types';

export const profileService = {
  get: (username: string): Promise<Profile> =>
    api.get<{ profile: Profile }>(`/profiles/${username}`).then(data => data.profile),

  follow: (username: string): Promise<Profile> =>
    api.post<{ profile: Profile }>(`/profiles/${username}/follow`, {}).then(data => data.profile),

  unfollow: (username: string): Promise<Profile> =>
    api.delete<{ profile: Profile }>(`/profiles/${username}/follow`).then(data => data.profile),
};

import api from './api';

export const tagService = {
  getAll: async (): Promise<string[]> => {
    const response = await api.get<{ tags: string[] }>('/tags');
    return response.data.tags;
  },
};

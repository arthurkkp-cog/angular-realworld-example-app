import api from './api';
import type { Comment } from '../types';

export const commentService = {
  getAll: async (slug: string): Promise<Comment[]> => {
    const response = await api.get<{ comments: Comment[] }>(`/articles/${slug}/comments`);
    return response.data.comments;
  },

  add: async (slug: string, body: string): Promise<Comment> => {
    const response = await api.post<{ comment: Comment }>(`/articles/${slug}/comments`, {
      comment: { body },
    });
    return response.data.comment;
  },

  delete: async (commentId: string, slug: string): Promise<void> => {
    await api.delete(`/articles/${slug}/comments/${commentId}`);
  },
};

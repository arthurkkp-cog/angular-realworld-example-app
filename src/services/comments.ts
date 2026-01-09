import { api } from './api';
import { Comment } from '../types';

export const commentsService = {
  getAll: (slug: string): Promise<Comment[]> =>
    api.get<{ comments: Comment[] }>(`/articles/${slug}/comments`).then(data => data.comments),

  add: (slug: string, body: string): Promise<Comment> =>
    api
      .post<{ comment: Comment }>(`/articles/${slug}/comments`, {
        comment: { body },
      })
      .then(data => data.comment),

  delete: (commentId: string, slug: string): Promise<void> => api.delete(`/articles/${slug}/comments/${commentId}`),
};

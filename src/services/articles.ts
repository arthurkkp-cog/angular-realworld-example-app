import { api } from './api';
import { Article, ArticleListConfig, ArticlesResponse } from '../types';

export const articlesService = {
  query: (config: ArticleListConfig): Promise<ArticlesResponse> => {
    const params = new URLSearchParams();
    Object.entries(config.filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });
    const queryString = params.toString();
    const endpoint = config.type === 'feed' ? '/articles/feed' : '/articles';
    return api.get<ArticlesResponse>(`${endpoint}${queryString ? `?${queryString}` : ''}`);
  },

  get: (slug: string): Promise<Article> =>
    api.get<{ article: Article }>(`/articles/${slug}`).then(data => data.article),

  create: (article: Partial<Article>): Promise<Article> =>
    api.post<{ article: Article }>('/articles/', { article }).then(data => data.article),

  update: (article: Partial<Article>): Promise<Article> =>
    api.put<{ article: Article }>(`/articles/${article.slug}`, { article }).then(data => data.article),

  delete: (slug: string): Promise<void> => api.delete(`/articles/${slug}`),

  favorite: (slug: string): Promise<Article> =>
    api.post<{ article: Article }>(`/articles/${slug}/favorite`, {}).then(data => data.article),

  unfavorite: (slug: string): Promise<void> => api.delete(`/articles/${slug}/favorite`),
};

import api from './api';
import type { Article, ArticleListConfig, ArticlesResponse } from '../types';

export const articleService = {
  getArticles: async (config: ArticleListConfig): Promise<ArticlesResponse> => {
    const params = new URLSearchParams();
    Object.entries(config.filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    });
    const endpoint = config.type === 'feed' ? '/articles/feed' : '/articles';
    const response = await api.get<ArticlesResponse>(endpoint, { params });
    return response.data;
  },

  getArticle: async (slug: string): Promise<Article> => {
    const response = await api.get<{ article: Article }>(`/articles/${slug}`);
    return response.data.article;
  },

  createArticle: async (article: Partial<Article>): Promise<Article> => {
    const response = await api.post<{ article: Article }>('/articles/', { article });
    return response.data.article;
  },

  updateArticle: async (slug: string, article: Partial<Article>): Promise<Article> => {
    const response = await api.put<{ article: Article }>(`/articles/${slug}`, { article });
    return response.data.article;
  },

  deleteArticle: async (slug: string): Promise<void> => {
    await api.delete(`/articles/${slug}`);
  },

  favoriteArticle: async (slug: string): Promise<Article> => {
    const response = await api.post<{ article: Article }>(`/articles/${slug}/favorite`, {});
    return response.data.article;
  },

  unfavoriteArticle: async (slug: string): Promise<void> => {
    await api.delete(`/articles/${slug}/favorite`);
  },
};

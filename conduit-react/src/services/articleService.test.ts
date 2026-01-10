import { describe, it, expect, vi, beforeEach } from 'vitest';
import { articleService, tagsService, commentsService } from './articleService';
import api from './api';
import { mockArticle, mockComment, createMockAxiosResponse } from '../test/mocks';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('articleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getArticles', () => {
    it('should call api.get with correct endpoint for all articles', async () => {
      const config = { type: 'all' as const, filters: { limit: 10, offset: 0 } };
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ articles: [mockArticle], articlesCount: 1 }));

      const result = await articleService.getArticles(config);

      expect(api.get).toHaveBeenCalledWith('/articles', expect.any(Object));
      expect(result.articles).toHaveLength(1);
      expect(result.articlesCount).toBe(1);
    });

    it('should call api.get with feed endpoint for feed type', async () => {
      const config = { type: 'feed' as const, filters: {} };
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ articles: [], articlesCount: 0 }));

      await articleService.getArticles(config);

      expect(api.get).toHaveBeenCalledWith('/articles/feed', expect.any(Object));
    });

    it('should pass filters as query params', async () => {
      const config = { type: 'all' as const, filters: { tag: 'react', author: 'testuser' } };
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ articles: [], articlesCount: 0 }));

      await articleService.getArticles(config);

      expect(api.get).toHaveBeenCalledWith('/articles', {
        params: expect.any(URLSearchParams),
      });
    });
  });

  describe('getArticle', () => {
    it('should call api.get with correct slug', async () => {
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ article: mockArticle }));

      const result = await articleService.getArticle('test-slug');

      expect(api.get).toHaveBeenCalledWith('/articles/test-slug');
      expect(result).toEqual(mockArticle);
    });
  });

  describe('createArticle', () => {
    it('should call api.post with article data', async () => {
      const articleData = { title: 'New Article', description: 'Desc', body: 'Body', tagList: [] };
      vi.mocked(api.post).mockResolvedValue(createMockAxiosResponse({ article: mockArticle }));

      const result = await articleService.createArticle(articleData);

      expect(api.post).toHaveBeenCalledWith('/articles', { article: articleData });
      expect(result).toEqual(mockArticle);
    });
  });

  describe('updateArticle', () => {
    it('should call api.put with slug and article data', async () => {
      const articleData = { title: 'Updated Title' };
      vi.mocked(api.put).mockResolvedValue(createMockAxiosResponse({ article: { ...mockArticle, ...articleData } }));

      const result = await articleService.updateArticle('test-slug', articleData);

      expect(api.put).toHaveBeenCalledWith('/articles/test-slug', { article: articleData });
      expect(result.title).toBe('Updated Title');
    });
  });

  describe('deleteArticle', () => {
    it('should call api.delete with correct slug', async () => {
      vi.mocked(api.delete).mockResolvedValue(createMockAxiosResponse({}));

      await articleService.deleteArticle('test-slug');

      expect(api.delete).toHaveBeenCalledWith('/articles/test-slug');
    });
  });

  describe('favoriteArticle', () => {
    it('should call api.post with correct endpoint', async () => {
      vi.mocked(api.post).mockResolvedValue(
        createMockAxiosResponse({ article: { ...mockArticle, favorited: true, favoritesCount: 6 } }),
      );

      const result = await articleService.favoriteArticle('test-slug');

      expect(api.post).toHaveBeenCalledWith('/articles/test-slug/favorite', {});
      expect(result.favorited).toBe(true);
    });
  });

  describe('unfavoriteArticle', () => {
    it('should call api.delete with correct endpoint', async () => {
      vi.mocked(api.delete).mockResolvedValue(createMockAxiosResponse({}));

      await articleService.unfavoriteArticle('test-slug');

      expect(api.delete).toHaveBeenCalledWith('/articles/test-slug/favorite');
    });
  });
});

describe('tagsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTags', () => {
    it('should call api.get and return tags array', async () => {
      const tags = ['react', 'javascript', 'typescript'];
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ tags }));

      const result = await tagsService.getTags();

      expect(api.get).toHaveBeenCalledWith('/tags');
      expect(result).toEqual(tags);
    });
  });
});

describe('commentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getComments', () => {
    it('should call api.get with correct endpoint', async () => {
      vi.mocked(api.get).mockResolvedValue(createMockAxiosResponse({ comments: [mockComment] }));

      const result = await commentsService.getComments('test-slug');

      expect(api.get).toHaveBeenCalledWith('/articles/test-slug/comments');
      expect(result).toHaveLength(1);
    });
  });

  describe('addComment', () => {
    it('should call api.post with comment body', async () => {
      vi.mocked(api.post).mockResolvedValue(createMockAxiosResponse({ comment: mockComment }));

      const result = await commentsService.addComment('test-slug', 'New comment');

      expect(api.post).toHaveBeenCalledWith('/articles/test-slug/comments', {
        comment: { body: 'New comment' },
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('deleteComment', () => {
    it('should call api.delete with correct endpoint', async () => {
      vi.mocked(api.delete).mockResolvedValue(createMockAxiosResponse({}));

      await commentsService.deleteComment('test-slug', '1');

      expect(api.delete).toHaveBeenCalledWith('/articles/test-slug/comments/1');
    });
  });
});

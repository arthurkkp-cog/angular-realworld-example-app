import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArticleList } from './ArticleList';
import { AuthProvider } from '../features/auth/AuthContext';
import { articleService } from '../services/articleService';
import { mockArticle } from '../test/mocks';

vi.mock('../services/articleService', () => ({
  articleService: {
    getArticles: vi.fn(),
  },
}));

vi.mock('../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderArticleList(config = { type: 'all' as const, filters: {} }, limit = 10) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ArticleList config={config} limit={limit} />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ArticleList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  it('should show loading state initially', () => {
    vi.mocked(articleService.getArticles).mockImplementation(() => new Promise(() => {}));

    renderArticleList();

    expect(screen.getByText('Loading articles...')).toBeInTheDocument();
  });

  it('should render articles when loaded', async () => {
    vi.mocked(articleService.getArticles).mockResolvedValue({
      articles: [mockArticle],
      articlesCount: 1,
    });

    renderArticleList();

    await waitFor(() => {
      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    });
  });

  it('should show no articles message when empty', async () => {
    vi.mocked(articleService.getArticles).mockResolvedValue({
      articles: [],
      articlesCount: 0,
    });

    renderArticleList();

    await waitFor(() => {
      expect(screen.getByText('No articles are here... yet.')).toBeInTheDocument();
    });
  });

  it('should render pagination when there are multiple pages', async () => {
    vi.mocked(articleService.getArticles).mockResolvedValue({
      articles: [mockArticle],
      articlesCount: 25,
    });

    renderArticleList();

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('should change page when pagination is clicked', async () => {
    vi.mocked(articleService.getArticles).mockResolvedValue({
      articles: [mockArticle],
      articlesCount: 25,
    });

    renderArticleList();

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('2'));

    await waitFor(() => {
      expect(articleService.getArticles).toHaveBeenCalledTimes(2);
    });
  });

  it('should pass correct config to getArticles', async () => {
    vi.mocked(articleService.getArticles).mockResolvedValue({
      articles: [],
      articlesCount: 0,
    });

    const config = { type: 'feed' as const, filters: { tag: 'react' } };
    renderArticleList(config);

    await waitFor(() => {
      expect(articleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'feed',
          filters: expect.objectContaining({ tag: 'react' }),
        })
      );
    });
  });
});

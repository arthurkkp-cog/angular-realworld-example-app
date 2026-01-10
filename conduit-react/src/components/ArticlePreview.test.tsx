import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArticlePreview } from './ArticlePreview';
import { AuthProvider } from '../features/auth/AuthContext';
import { mockArticle } from '../test/mocks';

vi.mock('../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderArticlePreview(article = mockArticle) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <ArticlePreview article={article} />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ArticlePreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  it('should render article title', () => {
    renderArticlePreview();

    expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
  });

  it('should render article description', () => {
    renderArticlePreview();

    expect(screen.getByText(mockArticle.description)).toBeInTheDocument();
  });

  it('should render author username', () => {
    renderArticlePreview();

    expect(screen.getByText(mockArticle.author.username)).toBeInTheDocument();
  });

  it('should render Read more link', () => {
    renderArticlePreview();

    expect(screen.getByText('Read more...')).toBeInTheDocument();
  });

  it('should render tags', () => {
    renderArticlePreview();

    mockArticle.tagList.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('should link to article page', () => {
    renderArticlePreview();

    const titleLink = screen.getByText(mockArticle.title).closest('a');
    expect(titleLink).toHaveAttribute('href', `/article/${mockArticle.slug}`);
  });

  it('should link to author profile', () => {
    renderArticlePreview();

    const authorLink = screen.getByText(mockArticle.author.username).closest('a');
    expect(authorLink).toHaveAttribute('href', `/profile/${mockArticle.author.username}`);
  });

  it('should render favorite count', () => {
    renderArticlePreview();

    expect(screen.getByText(mockArticle.favoritesCount.toString())).toBeInTheDocument();
  });

  it('should update favorite count when favorited', async () => {
    const unfavoritedArticle = { ...mockArticle, favorited: false, favoritesCount: 5 };
    renderArticlePreview(unfavoritedArticle);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should update favorite count when unfavorited', async () => {
    const favoritedArticle = { ...mockArticle, favorited: true, favoritesCount: 10 };
    renderArticlePreview(favoritedArticle);

    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

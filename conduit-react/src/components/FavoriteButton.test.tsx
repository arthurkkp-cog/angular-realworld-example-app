import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FavoriteButton } from './FavoriteButton';
import { AuthProvider } from '../features/auth/AuthContext';
import { articleService } from '../services/articleService';
import { userService } from '../services/userService';
import { mockArticle, mockUser } from '../test/mocks';

vi.mock('../services/articleService', () => ({
  articleService: {
    favoriteArticle: vi.fn(),
    unfavoriteArticle: vi.fn(),
  },
}));

vi.mock('../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderFavoriteButton(article = mockArticle, onToggle = vi.fn(), children?: React.ReactNode) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <FavoriteButton article={article} onToggle={onToggle}>
          {children}
        </FavoriteButton>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('FavoriteButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render children content', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderFavoriteButton(mockArticle, vi.fn(), mockArticle.favoritesCount);

    await waitFor(() => {
      expect(screen.getByText(mockArticle.favoritesCount.toString())).toBeInTheDocument();
    });
  });

  it('should show unfavorited state when article is not favorited', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderFavoriteButton({ ...mockArticle, favorited: false });

    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('btn-primary');
  });

  it('should show favorited state when article is favorited', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    renderFavoriteButton({ ...mockArticle, favorited: true });

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveClass('btn-primary');
    });
  });

  it('should call favoriteArticle when clicking unfavorited button', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(articleService.favoriteArticle).mockResolvedValue({
      ...mockArticle,
      favorited: true,
      favoritesCount: 6,
    });

    const onToggle = vi.fn();
    renderFavoriteButton({ ...mockArticle, favorited: false }, onToggle);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(articleService.favoriteArticle).toHaveBeenCalledWith(mockArticle.slug);
    });
  });

  it('should call unfavoriteArticle when clicking favorited button', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(articleService.unfavoriteArticle).mockResolvedValue(undefined);

    const onToggle = vi.fn();
    renderFavoriteButton({ ...mockArticle, favorited: true }, onToggle);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(articleService.unfavoriteArticle).toHaveBeenCalledWith(mockArticle.slug);
    });
  });
});

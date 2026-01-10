import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from './HomePage';
import { AuthProvider } from '../auth/AuthContext';
import { articleService, tagsService } from '../../services/articleService';
import { userService } from '../../services/userService';
import { mockArticle, mockUser } from '../../test/mocks';

vi.mock('../../services/articleService', () => ({
  articleService: {
    getArticles: vi.fn(),
  },
  tagsService: {
    getTags: vi.fn(),
  },
}));

vi.mock('../../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderHomePage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <HomePage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(articleService.getArticles).mockResolvedValue({
      articles: [mockArticle],
      articlesCount: 1,
    });
    vi.mocked(tagsService.getTags).mockResolvedValue(['react', 'javascript']);
  });

  it('should render banner with conduit title', () => {
    renderHomePage();

    expect(screen.getByText('conduit')).toBeInTheDocument();
    expect(screen.getByText('A place to share your knowledge.')).toBeInTheDocument();
  });

  it('should render Global Feed tab', () => {
    renderHomePage();

    expect(screen.getByText('Global Feed')).toBeInTheDocument();
  });

  it('should render Your Feed tab when authenticated', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Your Feed')).toBeInTheDocument();
    });
  });

  it('should not render Your Feed tab when not authenticated', () => {
    renderHomePage();

    expect(screen.queryByText('Your Feed')).not.toBeInTheDocument();
  });

  it('should render Popular Tags section', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Popular Tags')).toBeInTheDocument();
    });
  });

  it('should render tags from API', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  it('should render articles', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    });
  });

  it('should switch to feed when Your Feed is clicked', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('Your Feed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Your Feed'));

    await waitFor(() => {
      expect(articleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'feed' })
      );
    });
  });

  it('should filter by tag when tag is clicked', async () => {
    renderHomePage();

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('react'));

    await waitFor(() => {
      expect(articleService.getArticles).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({ tag: 'react' }),
        })
      );
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ArticlePage } from './ArticlePage';
import { AuthProvider } from '../auth/AuthContext';
import { articleService, commentsService } from '../../services/articleService';
import { userService } from '../../services/userService';
import { mockArticle, mockComment, mockUser } from '../../test/mocks';

vi.mock('../../services/articleService', () => ({
  articleService: {
    getArticle: vi.fn(),
    deleteArticle: vi.fn(),
    favoriteArticle: vi.fn(),
    unfavoriteArticle: vi.fn(),
  },
  commentsService: {
    getComments: vi.fn(),
    addComment: vi.fn(),
    deleteComment: vi.fn(),
  },
}));

vi.mock('../../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

vi.mock('../../services/profileService', () => ({
  profileService: {
    follow: vi.fn(),
    unfollow: vi.fn(),
  },
}));

function renderArticlePage(slug = 'test-article') {
  return render(
    <MemoryRouter initialEntries={[`/article/${slug}`]}>
      <AuthProvider>
        <Routes>
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ArticlePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(articleService.getArticle).mockResolvedValue(mockArticle);
    vi.mocked(commentsService.getComments).mockResolvedValue([mockComment]);
  });

  it('should render article title', async () => {
    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    });
  });

  it('should render article body', async () => {
    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByText(mockArticle.body)).toBeInTheDocument();
    });
  });

  it('should render author username', async () => {
    renderArticlePage();

    await waitFor(() => {
      expect(screen.getAllByText(mockArticle.author.username).length).toBeGreaterThan(0);
    });
  });

  it('should render article tags', async () => {
    renderArticlePage();

    await waitFor(() => {
      mockArticle.tagList.forEach((tag) => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  it('should render comments', async () => {
    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByText(mockComment.body)).toBeInTheDocument();
    });
  });

  it('should show edit/delete buttons when user is author', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: mockArticle.author.username,
    });

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getAllByText('Edit Article').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Delete Article').length).toBeGreaterThan(0);
    });
  });

  it('should not show edit/delete buttons when user is not author', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: 'differentuser',
    });

    renderArticlePage();

    await waitFor(() => {
      expect(screen.queryByText('Edit Article')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Article')).not.toBeInTheDocument();
    });
  });

  it('should show comment form when authenticated', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });
  });

  it('should add comment when form is submitted', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(commentsService.addComment).mockResolvedValue({
      ...mockComment,
      id: 2,
      body: 'New comment',
    });

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Write a comment...'), {
      target: { value: 'New comment' },
    });
    fireEvent.click(screen.getByText('Post Comment'));

    await waitFor(() => {
      expect(commentsService.addComment).toHaveBeenCalled();
    });
  });

  it('should delete article when delete button is clicked', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: mockArticle.author.username,
    });
    vi.mocked(articleService.deleteArticle).mockResolvedValue(undefined);

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getAllByText('Delete Article').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText('Delete Article')[0]);

    await waitFor(() => {
      expect(articleService.deleteArticle).toHaveBeenCalledWith(mockArticle.slug);
    });
  });

  it('should show sign in/sign up links when not authenticated', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByText('sign up')).toBeInTheDocument();
    });
  });

  it('should show Favorite Article button when not author', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: 'differentuser',
    });

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getAllByText(/Favorite Article/i).length).toBeGreaterThan(0);
    });
  });

  it('should show Unfavorite Article button when article is favorited', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: 'differentuser',
    });
    vi.mocked(articleService.getArticle).mockResolvedValue({
      ...mockArticle,
      favorited: true,
    });

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getAllByText(/Unfavorite Article/i).length).toBeGreaterThan(0);
    });
  });

  it('should navigate to home on fetch error', async () => {
    vi.mocked(articleService.getArticle).mockRejectedValue(new Error('Not found'));

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeInTheDocument();
    });
  });

  it('should handle comment form error', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(commentsService.addComment).mockRejectedValue({
      errors: { body: ["can't be blank"] },
    });

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Write a comment...')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText('Write a comment...'), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByText('Post Comment'));

    await waitFor(() => {
      expect(commentsService.addComment).toHaveBeenCalled();
    });
  });

  it('should handle delete article error', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: mockArticle.author.username,
    });
    vi.mocked(articleService.deleteArticle).mockRejectedValue(new Error('Failed'));

    renderArticlePage();

    await waitFor(() => {
      expect(screen.getAllByText('Delete Article').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByText('Delete Article')[0]);

    await waitFor(() => {
      expect(articleService.deleteArticle).toHaveBeenCalled();
    });
  });
});

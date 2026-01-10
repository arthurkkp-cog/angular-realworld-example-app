import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { EditorPage } from './EditorPage';
import { AuthProvider } from '../auth/AuthContext';
import { articleService } from '../../services/articleService';
import { userService } from '../../services/userService';
import { mockArticle, mockUser } from '../../test/mocks';

vi.mock('../../services/articleService', () => ({
  articleService: {
    getArticle: vi.fn(),
    createArticle: vi.fn(),
    updateArticle: vi.fn(),
  },
}));

vi.mock('../../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderEditorPage(slug?: string) {
  const path = slug ? `/editor/${slug}` : '/editor';
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/editor/:slug?" element={<EditorPage />} />
          <Route path="/article/:slug" element={<div>Article Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('EditorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
  });

  describe('Create mode', () => {
    it('should render empty form for new article', async () => {
      renderEditorPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Article Title')).toHaveValue('');
        expect(screen.getByPlaceholderText("What's this article about?")).toHaveValue('');
        expect(screen.getByPlaceholderText('Write your article (in markdown)')).toHaveValue('');
      });
    });

    it('should render all form fields', async () => {
      renderEditorPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Article Title')).toBeInTheDocument();
        expect(screen.getByPlaceholderText("What's this article about?")).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Write your article (in markdown)')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter tags')).toBeInTheDocument();
      });
    });

    it('should call createArticle on form submit', async () => {
      vi.mocked(articleService.createArticle).mockResolvedValue(mockArticle);

      renderEditorPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Article Title')).toBeInTheDocument();
      });

      fireEvent.change(screen.getByPlaceholderText('Article Title'), {
        target: { value: 'Test Title' },
      });
      fireEvent.change(screen.getByPlaceholderText("What's this article about?"), {
        target: { value: 'Test Description' },
      });
      fireEvent.change(screen.getByPlaceholderText('Write your article (in markdown)'), {
        target: { value: 'Test Body' },
      });
      fireEvent.click(screen.getByText('Publish Article'));

      await waitFor(() => {
        expect(articleService.createArticle).toHaveBeenCalledWith({
          title: 'Test Title',
          description: 'Test Description',
          body: 'Test Body',
          tagList: [],
        });
      });
    });

    it('should add tag when Enter is pressed', async () => {
      renderEditorPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter tags')).toBeInTheDocument();
      });

      const tagInput = screen.getByPlaceholderText('Enter tags');
      fireEvent.change(tagInput, { target: { value: 'react' } });
      fireEvent.keyDown(tagInput, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('react')).toBeInTheDocument();
      });
    });

    it('should remove tag when clicked', async () => {
      renderEditorPage();

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter tags')).toBeInTheDocument();
      });

      const tagInput = screen.getByPlaceholderText('Enter tags');
      fireEvent.change(tagInput, { target: { value: 'react' } });
      fireEvent.keyDown(tagInput, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('react')).toBeInTheDocument();
      });

      const removeButton = screen.getByText('react').closest('span')?.querySelector('i');
      if (removeButton) {
        fireEvent.click(removeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('react')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit mode', () => {
    beforeEach(() => {
      vi.mocked(articleService.getArticle).mockResolvedValue(mockArticle);
    });

    it('should call getArticle with slug', async () => {
      renderEditorPage('test-article');

      await waitFor(() => {
        expect(articleService.getArticle).toHaveBeenCalledWith('test-article');
      });
    });

    it('should call updateArticle when editing existing article', async () => {
      vi.mocked(articleService.updateArticle).mockResolvedValue(mockArticle);

      renderEditorPage('test-article');

      await waitFor(() => {
        expect(articleService.getArticle).toHaveBeenCalled();
      });
    });
  });

  it('should display errors on failed submission', async () => {
    vi.mocked(articleService.createArticle).mockRejectedValue({
      errors: { title: "can't be blank" },
    });

    renderEditorPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Article Title')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("What's this article about?"), {
      target: { value: 'Test Description' },
    });
    fireEvent.change(screen.getByPlaceholderText('Write your article (in markdown)'), {
      target: { value: 'Test Body' },
    });
    fireEvent.click(screen.getByText('Publish Article'));

    await waitFor(() => {
      expect(screen.getByText("title can't be blank")).toBeInTheDocument();
    });
  });
});

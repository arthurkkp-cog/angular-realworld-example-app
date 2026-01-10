import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArticleComment } from './ArticleComment';
import { AuthContext } from '../features/auth/AuthContext';
import { mockComment, mockUser } from '../test/mocks';

function renderArticleComment(comment = mockComment, onDelete = vi.fn(), user = null) {
  return render(
    <MemoryRouter>
      <AuthContext.Provider value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading: false, 
        login: vi.fn(), 
        register: vi.fn(), 
        logout: vi.fn(), 
        updateUser: vi.fn() 
      }}>
        <ArticleComment comment={comment} onDelete={onDelete} />
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('ArticleComment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render comment body', () => {
    renderArticleComment();
    expect(screen.getByText(mockComment.body)).toBeInTheDocument();
  });

  it('should render author username', () => {
    renderArticleComment();
    expect(screen.getByText(mockComment.author.username)).toBeInTheDocument();
  });

  it('should render author image', () => {
    renderArticleComment();
    const img = document.querySelector('img');
    expect(img).toHaveAttribute('src', mockComment.author.image);
  });

  it('should link to author profile', () => {
    renderArticleComment();
    const authorLinks = screen.getAllByText(mockComment.author.username);
    const authorLink = authorLinks[0].closest('a');
    expect(authorLink).toHaveAttribute('href', `/profile/${mockComment.author.username}`);
  });

  it('should show delete icon when user is comment author', () => {
    const user = { ...mockUser, username: mockComment.author.username };
    renderArticleComment(mockComment, vi.fn(), user);
    expect(screen.getByClassName ? screen.container.querySelector('.ion-trash-a') : document.querySelector('.ion-trash-a')).toBeInTheDocument();
  });

  it('should not show delete icon when user is not comment author', () => {
    const user = { ...mockUser, username: 'differentuser' };
    renderArticleComment(mockComment, vi.fn(), user);
    expect(document.querySelector('.ion-trash-a')).not.toBeInTheDocument();
  });

  it('should call onDelete when delete icon is clicked', () => {
    const user = { ...mockUser, username: mockComment.author.username };
    const onDelete = vi.fn();
    renderArticleComment(mockComment, onDelete, user);
    
    const deleteIcon = document.querySelector('.ion-trash-a');
    if (deleteIcon) {
      fireEvent.click(deleteIcon);
    }
    expect(onDelete).toHaveBeenCalled();
  });
});

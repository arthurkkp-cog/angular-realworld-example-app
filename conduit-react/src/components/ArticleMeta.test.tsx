import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ArticleMeta } from './ArticleMeta';
import { mockArticle } from '../test/mocks';

function renderArticleMeta(article = mockArticle) {
  return render(
    <MemoryRouter>
      <ArticleMeta article={article} />
    </MemoryRouter>
  );
}

describe('ArticleMeta', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render author image', () => {
    renderArticleMeta();
    const img = document.querySelector('img');
    expect(img).toHaveAttribute('src', mockArticle.author.image);
  });

  it('should render author username', () => {
    renderArticleMeta();
    expect(screen.getByText(mockArticle.author.username)).toBeInTheDocument();
  });

  it('should link to author profile', () => {
    renderArticleMeta();
    const authorLink = screen.getByText(mockArticle.author.username).closest('a');
    expect(authorLink).toHaveAttribute('href', `/profile/${mockArticle.author.username}`);
  });

  it('should render formatted date', () => {
    renderArticleMeta();
    const date = new Date(mockArticle.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});

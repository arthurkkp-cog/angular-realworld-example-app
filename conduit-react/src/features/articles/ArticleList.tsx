import { useState, useEffect } from 'react';
import { articleService } from '../../services/articleService';
import type { Article, ArticleListConfig } from '../../types';
import { ArticlePreview } from './ArticlePreview';

interface ArticleListProps {
  config: ArticleListConfig;
  limit: number;
}

type LoadingState = 'NOT_LOADED' | 'LOADING' | 'LOADED';

export function ArticleList({ config, limit }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState<number[]>([]);
  const [loading, setLoading] = useState<LoadingState>('NOT_LOADED');

  useEffect(() => {
    setCurrentPage(1);
    runQuery(1);
  }, [config]);

  const runQuery = async (page: number) => {
    setLoading('LOADING');
    setArticles([]);

    const queryConfig: ArticleListConfig = {
      ...config,
      filters: {
        ...config.filters,
        limit,
        offset: limit * (page - 1),
      },
    };

    try {
      const data = await articleService.getArticles(queryConfig);
      setArticles(data.articles);
      setTotalPages(
        Array.from(new Array(Math.ceil(data.articlesCount / limit)), (_, index) => index + 1)
      );
      setLoading('LOADED');
    } catch {
      setLoading('LOADED');
    }
  };

  const setPageTo = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    runQuery(pageNumber);
  };

  const handleToggleFavorite = (slug: string, favorited: boolean) => {
    setArticles((prevArticles) =>
      prevArticles.map((article) =>
        article.slug === slug
          ? {
              ...article,
              favorited,
              favoritesCount: favorited
                ? article.favoritesCount + 1
                : article.favoritesCount - 1,
            }
          : article
      )
    );
  };

  if (loading === 'LOADING') {
    return <div className="article-preview">Loading articles...</div>;
  }

  if (loading === 'LOADED') {
    return (
      <>
        {articles.length === 0 ? (
          <div className="article-preview">No articles are here... yet.</div>
        ) : (
          articles.map((article) => (
            <ArticlePreview
              key={article.slug}
              article={article}
              onToggleFavorite={handleToggleFavorite}
            />
          ))
        )}

        <nav>
          <ul className="pagination">
            {totalPages.map((pageNumber) => (
              <li
                key={pageNumber}
                className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}
              >
                <button className="page-link" onClick={() => setPageTo(pageNumber)}>
                  {pageNumber}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </>
    );
  }

  return null;
}

import { useState, useEffect } from 'react';
import { ArticleListConfig, Article } from '../types';
import { articlesService } from '../services/articles';
import { ArticlePreview } from './ArticlePreview';

interface ArticleListProps {
  config: ArticleListConfig;
  limit?: number;
}

export function ArticleList({ config, limit = 10 }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesCount, setArticlesCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentPage(1);
  }, [config]);

  useEffect(() => {
    setIsLoading(true);
    const queryConfig: ArticleListConfig = {
      ...config,
      filters: {
        ...config.filters,
        limit,
        offset: limit * (currentPage - 1),
      },
    };

    articlesService
      .query(queryConfig)
      .then(data => {
        setArticles(data.articles);
        setArticlesCount(data.articlesCount);
      })
      .catch(() => {
        setArticles([]);
        setArticlesCount(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [config, currentPage, limit]);

  const totalPages = Math.ceil(articlesCount / limit);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (isLoading) {
    return <div className="article-preview">Loading articles...</div>;
  }

  if (articles.length === 0) {
    return <div className="article-preview">No articles are here... yet.</div>;
  }

  return (
    <>
      {articles.map(article => (
        <ArticlePreview key={article.slug} article={article} />
      ))}

      {totalPages > 1 && (
        <nav>
          <ul className="pagination">
            {pageNumbers.map(pageNumber => (
              <li key={pageNumber} className={`page-item ${pageNumber === currentPage ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(pageNumber)} style={{ cursor: 'pointer' }}>
                  {pageNumber}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  );
}

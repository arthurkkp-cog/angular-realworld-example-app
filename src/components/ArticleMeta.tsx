import { Link } from 'react-router-dom';
import { Article } from '../types';

interface ArticleMetaProps {
  article: Article;
  children?: React.ReactNode;
}

export function ArticleMeta({ article, children }: ArticleMetaProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="article-meta">
      <Link to={`/profile/${article.author.username}`}>
        <img src={article.author.image} alt={article.author.username} />
      </Link>

      <div className="info">
        <Link className="author" to={`/profile/${article.author.username}`}>
          {article.author.username}
        </Link>
        <span className="date">{formattedDate}</span>
      </div>

      {children}
    </div>
  );
}

import { Link } from 'react-router-dom';
import type { Article } from '../../types';
import { ArticleMeta } from './ArticleMeta';
import { FavoriteButton } from '../../components/FavoriteButton';

interface ArticlePreviewProps {
  article: Article;
  onToggleFavorite: (slug: string, favorited: boolean) => void;
}

export function ArticlePreview({ article, onToggleFavorite }: ArticlePreviewProps) {
  const handleToggle = (favorited: boolean) => {
    onToggleFavorite(article.slug, favorited);
  };

  return (
    <div className="article-preview">
      <ArticleMeta article={article}>
        <FavoriteButton
          article={article}
          onToggle={handleToggle}
          className="pull-xs-right"
        >
          {article.favoritesCount}
        </FavoriteButton>
      </ArticleMeta>

      <Link to={`/article/${article.slug}`} className="preview-link">
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <span>Read more...</span>
        <ul className="tag-list">
          {article.tagList.map((tag) => (
            <li key={tag} className="tag-default tag-pill tag-outline">
              {tag}
            </li>
          ))}
        </ul>
      </Link>
    </div>
  );
}

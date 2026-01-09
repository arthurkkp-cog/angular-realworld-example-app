import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { articlesService } from '../services/articles';
import { Article } from '../types';

interface FavoriteButtonProps {
  article: Article;
  onToggle: (favorited: boolean) => void;
  children?: React.ReactNode;
}

export function FavoriteButton({ article, onToggle, children }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!article.favorited) {
        await articlesService.favorite(article.slug);
      } else {
        await articlesService.unfavorite(article.slug);
      }
      onToggle(!article.favorited);
    } catch {
      // Error handling - revert state if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className={`btn btn-sm ${
        article.favorited ? 'btn-primary' : 'btn-outline-primary'
      } ${isSubmitting ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={isSubmitting}
    >
      <i className="ion-heart"></i> {children}
    </button>
  );
}

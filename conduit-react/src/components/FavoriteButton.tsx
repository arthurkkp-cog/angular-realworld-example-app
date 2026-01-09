import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { articleService } from '../services/articleService';
import type { Article } from '../types';

interface FavoriteButtonProps {
  article: Article;
  onToggle: (favorited: boolean) => void;
  className?: string;
  children?: ReactNode;
}

export function FavoriteButton({ article, onToggle, className = '', children }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    setIsSubmitting(true);

    try {
      if (!article.favorited) {
        await articleService.favoriteArticle(article.slug);
        onToggle(true);
      } else {
        await articleService.unfavoriteArticle(article.slug);
        onToggle(false);
      }
    } catch {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = `btn btn-sm ${article.favorited ? 'btn-primary' : 'btn-outline-primary'} ${isSubmitting ? 'disabled' : ''} ${className}`;

  return (
    <button className={buttonClass} onClick={toggleFavorite} disabled={isSubmitting}>
      <i className="ion-heart"></i> {children}
    </button>
  );
}

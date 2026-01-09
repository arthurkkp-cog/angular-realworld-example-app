import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { articleService } from '../services/articleService';
import { Article } from '../types';

interface FavoriteButtonProps {
  article: Article;
  onToggle: (favorited: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

export function FavoriteButton({ article, onToggle, children, className = '' }: FavoriteButtonProps) {
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
      if (article.favorited) {
        await articleService.unfavoriteArticle(article.slug);
        onToggle(false);
      } else {
        await articleService.favoriteArticle(article.slug);
        onToggle(true);
      }
    } catch {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = `btn btn-sm ${className} ${
    isSubmitting ? 'disabled' : ''
  } ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`;

  return (
    <button className={buttonClass} onClick={handleClick} disabled={isSubmitting}>
      <i className="ion-heart"></i> {children}
    </button>
  );
}

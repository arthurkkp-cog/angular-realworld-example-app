import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../auth/AuthContext';
import { Article, Comment, Errors, Profile } from '../../types';
import { articleService, commentsService } from '../../services/articleService';
import { ArticleMeta } from '../../components/ArticleMeta';
import { FavoriteButton } from '../../components/FavoriteButton';
import { FollowButton } from '../../components/FollowButton';
import { ArticleComment } from '../../components/ArticleComment';
import { ListErrors } from '../../components/ListErrors';

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [commentFormErrors, setCommentFormErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      try {
        const [fetchedArticle, fetchedComments] = await Promise.all([
          articleService.getArticle(slug),
          commentsService.getComments(slug),
        ]);
        setArticle(fetchedArticle);
        setComments(fetchedComments);
      } catch {
        navigate('/');
      }
    };

    fetchData();
  }, [slug, navigate]);

  if (!article) {
    return null;
  }

  const canModify = user?.username === article.author.username;

  const handleToggleFavorite = (favorited: boolean) => {
    setArticle((prev) =>
      prev
        ? {
            ...prev,
            favorited,
            favoritesCount: favorited
              ? prev.favoritesCount + 1
              : prev.favoritesCount - 1,
          }
        : null
    );
  };

  const handleToggleFollowing = (profile: Profile) => {
    setArticle((prev) =>
      prev
        ? {
            ...prev,
            author: { ...prev.author, following: profile.following },
          }
        : null
    );
  };

  const handleDeleteArticle = async () => {
    setIsDeleting(true);
    try {
      await articleService.deleteArticle(article.slug);
      navigate('/');
    } catch {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    setIsSubmitting(true);
    setCommentFormErrors(null);

    try {
      const comment = await commentsService.addComment(slug, commentBody);
      setComments((prev) => [comment, ...prev]);
      setCommentBody('');
    } catch (err) {
      setCommentFormErrors(err as Errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (!slug) return;

    try {
      await commentsService.deleteComment(slug, comment.id);
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
    } catch {
      // Handle error silently
    }
  };

  const articleBody = marked.parse(article.body) as string;

  const renderArticleActions = () => (
    <ArticleMeta article={article}>
      {canModify ? (
        <span>
          <Link
            className="btn btn-sm btn-outline-secondary"
            to={`/editor/${article.slug}`}
          >
            <i className="ion-edit"></i> Edit Article
          </Link>
          <button
            className={`btn btn-sm btn-outline-danger ${isDeleting ? 'disabled' : ''}`}
            onClick={handleDeleteArticle}
            disabled={isDeleting}
          >
            <i className="ion-trash-a"></i> Delete Article
          </button>
        </span>
      ) : (
        <span>
          <FollowButton profile={article.author} onToggle={handleToggleFollowing} />
          <FavoriteButton article={article} onToggle={handleToggleFavorite}>
            {article.favorited ? 'Unfavorite' : 'Favorite'} Article
            <span className="counter">({article.favoritesCount})</span>
          </FavoriteButton>
        </span>
      )}
    </ArticleMeta>
  );

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>
          {renderArticleActions()}
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={{ __html: articleBody }} />
            <ul className="tag-list">
              {article.tagList.map((tag) => (
                <li key={tag} className="tag-default tag-pill tag-outline">
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr />

        <div className="article-actions">{renderArticleActions()}</div>

        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            {isAuthenticated ? (
              <div>
                <ListErrors errors={commentFormErrors} />
                <form className="card comment-form" onSubmit={handleAddComment}>
                  <fieldset disabled={isSubmitting}>
                    <div className="card-block">
                      <textarea
                        className="form-control"
                        placeholder="Write a comment..."
                        rows={3}
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                      />
                    </div>
                    <div className="card-footer">
                      <img
                        src={user?.image || ''}
                        className="comment-author-img"
                        alt=""
                      />
                      <button className="btn btn-sm btn-primary" type="submit">
                        Post Comment
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            ) : (
              <div>
                <Link to="/login">Sign in</Link> or{' '}
                <Link to="/register">sign up</Link> to add comments on this
                article.
              </div>
            )}

            {comments.map((comment) => (
              <ArticleComment
                key={comment.id}
                comment={comment}
                onDelete={() => handleDeleteComment(comment)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

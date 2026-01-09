import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { articleService } from '../../services/articleService';
import { commentService } from '../../services/commentService';
import type { Article, Comment, Errors, Profile } from '../../types';
import { ArticleMeta } from './ArticleMeta';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentFormErrors, setCommentFormErrors] = useState<Errors | null>(null);

  const canModify = user?.username === article?.author.username;

  useEffect(() => {
    if (!slug) return;

    Promise.all([articleService.getArticle(slug), commentService.getAll(slug)])
      .then(([article, comments]) => {
        setArticle(article);
        setComments(comments);
      })
      .catch(() => {
        navigate('/');
      });
  }, [slug, navigate]);

  const onToggleFavorite = (favorited: boolean) => {
    if (!article) return;
    setArticle({
      ...article,
      favorited,
      favoritesCount: favorited ? article.favoritesCount + 1 : article.favoritesCount - 1,
    });
  };

  const toggleFollowing = (profile: Profile) => {
    if (!article) return;
    setArticle({
      ...article,
      author: { ...article.author, following: profile.following },
    });
  };

  const deleteArticle = async () => {
    if (!article) return;
    setIsDeleting(true);
    try {
      await articleService.deleteArticle(article.slug);
      navigate('/');
    } catch {
      setIsDeleting(false);
    }
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug) return;

    setIsSubmitting(true);
    setCommentFormErrors(null);

    try {
      const comment = await commentService.add(slug, commentBody);
      setComments([comment, ...comments]);
      setCommentBody('');
    } catch (err) {
      setCommentFormErrors(err as Errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteComment = async (comment: Comment) => {
    if (!slug) return;
    try {
      await commentService.delete(comment.id, slug);
      setComments(comments.filter((c) => c !== comment));
    } catch {
      // Handle error silently
    }
  };

  if (!article) {
    return null;
  }

  const ArticleActions = () => (
    <>
      {canModify ? (
        <span>
          <Link className="btn btn-sm btn-outline-secondary" to={`/editor/${article.slug}`}>
            <i className="ion-edit"></i> Edit Article
          </Link>
          <button
            className={`btn btn-sm btn-outline-danger ${isDeleting ? 'disabled' : ''}`}
            onClick={deleteArticle}
            disabled={isDeleting}
          >
            <i className="ion-trash-a"></i> Delete Article
          </button>
        </span>
      ) : (
        <span>
          <FollowButton profile={article.author} onToggle={toggleFollowing} />
          <FavoriteButton article={article} onToggle={onToggleFavorite}>
            {article.favorited ? 'Unfavorite' : 'Favorite'} Article
            <span className="counter">({article.favoritesCount})</span>
          </FavoriteButton>
        </span>
      )}
    </>
  );

  return (
    <div className="article-page">
      <div className="banner">
        <div className="container">
          <h1>{article.title}</h1>

          <ArticleMeta article={article}>
            <ArticleActions />
          </ArticleMeta>
        </div>
      </div>

      <div className="container page">
        <div className="row article-content">
          <div className="col-md-12">
            <div dangerouslySetInnerHTML={{ __html: article.body }} />

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

        <div className="article-actions">
          <ArticleMeta article={article}>
            <ArticleActions />
          </ArticleMeta>
        </div>

        <div className="row">
          <div className="col-xs-12 col-md-8 offset-md-2">
            {isAuthenticated ? (
              <div>
                <ListErrors errors={commentFormErrors} />
                <form className="card comment-form" onSubmit={addComment}>
                  <fieldset disabled={isSubmitting}>
                    <div className="card-block">
                      <textarea
                        className="form-control"
                        placeholder="Write a comment..."
                        rows={3}
                        value={commentBody}
                        onChange={(e) => setCommentBody(e.target.value)}
                      ></textarea>
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
                <Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add
                comments on this article.
              </div>
            )}

            {comments.map((comment) => (
              <ArticleComment
                key={comment.id}
                comment={comment}
                onDelete={() => deleteComment(comment)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

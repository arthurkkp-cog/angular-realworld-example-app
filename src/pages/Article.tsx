import { useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marked } from 'marked';
import { useAuth } from '../context/AuthContext';
import { ArticleMeta } from '../components/ArticleMeta';
import { FavoriteButton } from '../components/FavoriteButton';
import { FollowButton } from '../components/FollowButton';
import { ArticleComment } from '../components/ArticleComment';
import { ListErrors } from '../components/ListErrors';
import { articlesService } from '../services/articles';
import { commentsService } from '../services/comments';
import { Article as ArticleType, Comment, Profile, Errors } from '../types';

export function Article() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [article, setArticle] = useState<ArticleType | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [commentFormErrors, setCommentFormErrors] = useState<Errors | null>(null);

  const canModify = currentUser?.username === article?.author.username;

  useEffect(() => {
    if (!slug) return;

    Promise.all([articlesService.get(slug), commentsService.getAll(slug)])
      .then(([articleData, commentsData]) => {
        setArticle(articleData);
        setComments(commentsData);
      })
      .catch(() => {
        navigate('/');
      });
  }, [slug, navigate]);

  const handleToggleFavorite = (favorited: boolean) => {
    if (!article) return;
    setArticle({
      ...article,
      favorited,
      favoritesCount: favorited ? article.favoritesCount + 1 : article.favoritesCount - 1,
    });
  };

  const handleToggleFollowing = (profile: Profile) => {
    if (!article) return;
    setArticle({
      ...article,
      author: { ...article.author, following: profile.following },
    });
  };

  const handleDeleteArticle = async () => {
    if (!article) return;
    setIsDeleting(true);
    try {
      await articlesService.delete(article.slug);
      navigate('/');
    } catch {
      setIsDeleting(false);
    }
  };

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!slug || !commentBody.trim()) return;

    setIsSubmitting(true);
    setCommentFormErrors(null);

    try {
      const comment = await commentsService.add(slug, commentBody);
      setComments([comment, ...comments]);
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
      await commentsService.delete(comment.id, slug);
      setComments(comments.filter(c => c.id !== comment.id));
    } catch {
      // Error handling
    }
  };

  if (!article) {
    return null;
  }

  const articleHtml = marked.parse(article.body) as string;

  const renderArticleActions = () => (
    <ArticleMeta article={article}>
      {canModify ? (
        <span>
          <Link className="btn btn-sm btn-outline-secondary" to={`/editor/${article.slug}`}>
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
            <div dangerouslySetInnerHTML={{ __html: articleHtml }} />

            <ul className="tag-list">
              {article.tagList.map(tag => (
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
            {isAuthenticated && currentUser && (
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
                        onChange={e => setCommentBody(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="card-footer">
                      <img src={currentUser.image || ''} className="comment-author-img" alt={currentUser.username} />
                      <button className="btn btn-sm btn-primary" type="submit">
                        Post Comment
                      </button>
                    </div>
                  </fieldset>
                </form>
              </div>
            )}

            {!isAuthenticated && (
              <div>
                <Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add comments on this article.
              </div>
            )}

            {comments.map(comment => (
              <ArticleComment key={comment.id} comment={comment} onDelete={() => handleDeleteComment(comment)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

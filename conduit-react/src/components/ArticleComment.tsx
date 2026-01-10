import { Link } from 'react-router-dom';
import { Comment } from '../types';
import { useAuth } from '../features/auth/AuthContext';

interface ArticleCommentProps {
  comment: Comment;
  onDelete: () => void;
}

export function ArticleComment({ comment, onDelete }: ArticleCommentProps) {
  const { user } = useAuth();
  const canModify = user?.username === comment.author.username;

  const formattedDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="card">
      <div className="card-block">
        <p className="card-text">{comment.body}</p>
      </div>
      <div className="card-footer">
        <Link className="comment-author" to={`/profile/${comment.author.username}`}>
          <img src={comment.author.image} className="comment-author-img" alt="" />
        </Link>
        &nbsp;
        <Link className="comment-author" to={`/profile/${comment.author.username}`}>
          {comment.author.username}
        </Link>
        <span className="date-posted">{formattedDate}</span>
        {canModify && (
          <span className="mod-options">
            <i className="ion-trash-a" onClick={onDelete}></i>
          </span>
        )}
      </div>
    </div>
  );
}

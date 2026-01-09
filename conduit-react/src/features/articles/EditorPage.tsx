import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { articleService } from '../../services/articleService';
import type { Errors } from '../../types';
import { ListErrors } from '../../components/ListErrors';

export function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [tagField, setTagField] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Errors | null>(null);

  useEffect(() => {
    if (slug) {
      articleService
        .getArticle(slug)
        .then((article) => {
          if (user?.username !== article.author.username) {
            navigate('/');
            return;
          }
          setTitle(article.title);
          setDescription(article.description);
          setBody(article.body);
          setTagList(article.tagList);
        })
        .catch(() => {
          navigate('/');
        });
    }
  }, [slug, user, navigate]);

  const addTag = () => {
    const tag = tagField.trim();
    if (tag !== '' && !tagList.includes(tag)) {
      setTagList([...tagList, tag]);
    }
    setTagField('');
  };

  const removeTag = (tagName: string) => {
    setTagList(tagList.filter((tag) => tag !== tagName));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const submitForm = async () => {
    setIsSubmitting(true);
    setErrors(null);

    // Add any remaining tag
    const finalTagList = [...tagList];
    const tag = tagField.trim();
    if (tag !== '' && !finalTagList.includes(tag)) {
      finalTagList.push(tag);
    }

    const articleData = {
      title,
      description,
      body,
      tagList: finalTagList,
    };

    try {
      let article;
      if (slug) {
        article = await articleService.updateArticle(slug, articleData);
      } else {
        article = await articleService.createArticle(articleData);
      }
      navigate(`/article/${article.slug}`);
    } catch (err) {
      setErrors(err as Errors);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="editor-page">
      <div className="container page">
        <div className="row">
          <div className="col-md-10 offset-md-1 col-xs-12">
            <ListErrors errors={errors} />

            <form>
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  <input
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="What's this article about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </fieldset>

                <fieldset className="form-group">
                  <textarea
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  ></textarea>
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter tags"
                    value={tagField}
                    onChange={(e) => setTagField(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <div className="tag-list">
                    {tagList.map((tag) => (
                      <span key={tag} className="tag-default tag-pill">
                        <i
                          className="ion-close-round"
                          onClick={() => removeTag(tag)}
                          style={{ cursor: 'pointer' }}
                        ></i>
                        {tag}
                      </span>
                    ))}
                  </div>
                </fieldset>

                <button
                  className="btn btn-lg pull-xs-right btn-primary"
                  type="button"
                  onClick={submitForm}
                >
                  Publish Article
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../auth/AuthContext';
import { articleService } from '../../services/articleService';
import { Errors } from '../../types';
import { ListErrors } from '../../components/ListErrors';

interface ArticleFormData {
  title: string;
  description: string;
  body: string;
}

export function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tagList, setTagList] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue } = useForm<ArticleFormData>();

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        const article = await articleService.getArticle(slug);
        if (user?.username !== article.author.username) {
          navigate('/');
          return;
        }
        setValue('title', article.title);
        setValue('description', article.description);
        setValue('body', article.body);
        setTagList(article.tagList);
      } catch {
        navigate('/');
      }
    };

    fetchArticle();
  }, [slug, user, navigate, setValue]);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tagList.includes(tag)) {
      setTagList((prev) => [...prev, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTagList((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    setErrors(null);

    addTag();

    const articleData = {
      ...data,
      tagList,
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

            <form onSubmit={handleSubmit(onSubmit)}>
              <fieldset disabled={isSubmitting}>
                <fieldset className="form-group">
                  <input
                    {...register('title')}
                    className="form-control form-control-lg"
                    type="text"
                    placeholder="Article Title"
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    {...register('description')}
                    className="form-control"
                    type="text"
                    placeholder="What's this article about?"
                  />
                </fieldset>

                <fieldset className="form-group">
                  <textarea
                    {...register('body')}
                    className="form-control"
                    rows={8}
                    placeholder="Write your article (in markdown)"
                  />
                </fieldset>

                <fieldset className="form-group">
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Enter tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                  />
                  <div className="tag-list">
                    {tagList.map((tag) => (
                      <span key={tag} className="tag-default tag-pill">
                        <i
                          className="ion-close-round"
                          onClick={() => removeTag(tag)}
                        ></i>
                        {tag}
                      </span>
                    ))}
                  </div>
                </fieldset>

                <button
                  className="btn btn-lg pull-xs-right btn-primary"
                  type="submit"
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

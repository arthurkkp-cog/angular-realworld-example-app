import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { ArticleList } from '../../components/ArticleList';
import { ArticleListConfig } from '../../types';
import { tagsService } from '../../services/articleService';

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tags, setTags] = useState<string[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);
  const [listConfig, setListConfig] = useState<ArticleListConfig>({
    type: 'all',
    filters: {},
  });

  useEffect(() => {
    if (isAuthenticated) {
      setListConfig({ type: 'feed', filters: {} });
    } else {
      setListConfig({ type: 'all', filters: {} });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await tagsService.getTags();
        setTags(fetchedTags);
      } catch {
        setTags([]);
      } finally {
        setTagsLoaded(true);
      }
    };
    fetchTags();
  }, []);

  const setListTo = (type: 'all' | 'feed', filters: ArticleListConfig['filters'] = {}) => {
    if (type === 'feed' && !isAuthenticated) {
      navigate('/login');
      return;
    }
    setListConfig({ type, filters });
  };

  return (
    <div className="home-page">
      {!isAuthenticated && (
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
      )}

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {isAuthenticated && (
                  <li className="nav-item">
                    <a
                      className={`nav-link ${listConfig.type === 'feed' ? 'active' : ''}`}
                      onClick={() => setListTo('feed')}
                      style={{ cursor: 'pointer' }}
                    >
                      Your Feed
                    </a>
                  </li>
                )}
                <li className="nav-item">
                  <a
                    className={`nav-link ${
                      listConfig.type === 'all' && !listConfig.filters.tag ? 'active' : ''
                    }`}
                    onClick={() => setListTo('all')}
                    style={{ cursor: 'pointer' }}
                  >
                    Global Feed
                  </a>
                </li>
                {listConfig.filters.tag && (
                  <li className="nav-item">
                    <a className="nav-link active">
                      <i className="ion-pound"></i> {listConfig.filters.tag}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <ArticleList config={listConfig} limit={10} />
          </div>

          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>

              <div className="tag-list">
                {tags.map((tag) => (
                  <a
                    key={tag}
                    className="tag-default tag-pill"
                    onClick={() => setListTo('all', { tag })}
                    style={{ cursor: 'pointer' }}
                  >
                    {tag}
                  </a>
                ))}
              </div>

              {!tagsLoaded && <div>Loading tags...</div>}

              {tagsLoaded && tags.length === 0 && (
                <div>No tags are here... yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

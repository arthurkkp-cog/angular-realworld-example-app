import { useOutletContext } from 'react-router-dom';
import { ArticleList } from '../components/ArticleList';
import { ArticleListConfig } from '../types';

interface ProfileContext {
  username: string;
}

export function ProfileArticles() {
  const { username } = useOutletContext<ProfileContext>();

  const config: ArticleListConfig = {
    type: 'all',
    filters: {
      author: username,
    },
  };

  return <ArticleList config={config} limit={10} />;
}

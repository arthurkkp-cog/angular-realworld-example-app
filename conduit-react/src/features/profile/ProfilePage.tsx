import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { Profile, ArticleListConfig } from '../../types';
import { profileService } from '../../services/profileService';
import { ArticleList } from '../../components/ArticleList';
import { FollowButton } from '../../components/FollowButton';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);

  const isFavoritesTab = location.pathname.endsWith('/favorites');
  const isUser = user?.username === username;

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        const fetchedProfile = await profileService.getProfile(username);
        setProfile(fetchedProfile);
      } catch {
        // Handle error silently
      }
    };

    fetchProfile();
  }, [username]);

  if (!profile) {
    return null;
  }

  const handleToggleFollowing = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const articlesConfig: ArticleListConfig = isFavoritesTab
    ? { type: 'all', filters: { favorited: profile.username } }
    : { type: 'all', filters: { author: profile.username } };

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img src={profile.image} className="user-img" alt="" />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              {!isUser && (
                <FollowButton profile={profile} onToggle={handleToggleFollowing} />
              )}
              {isUser && (
                <Link
                  to="/settings"
                  className="btn btn-sm btn-outline-secondary action-btn"
                >
                  <i className="ion-gear-a"></i> Edit Profile Settings
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-xs-12 col-md-10 offset-md-1">
            <div className="articles-toggle">
              <ul className="nav nav-pills outline-active">
                <li className="nav-item">
                  <Link
                    className={`nav-link ${!isFavoritesTab ? 'active' : ''}`}
                    to={`/profile/${profile.username}`}
                  >
                    My Posts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isFavoritesTab ? 'active' : ''}`}
                    to={`/profile/${profile.username}/favorites`}
                  >
                    Favorited Posts
                  </Link>
                </li>
              </ul>
            </div>

            <ArticleList config={articlesConfig} limit={10} />
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { profileService } from '../../services/profileService';
import type { Profile, ArticleListConfig } from '../../types';
import { FollowButton } from '../../components/FollowButton';
import { ArticleList } from '../articles/ArticleList';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(null);
  const isUser = user?.username === profile?.username;
  const isFavorites = location.pathname.endsWith('/favorites');

  useEffect(() => {
    if (!username) return;

    profileService
      .get(username)
      .then((profile) => {
        setProfile(profile);
      })
      .catch(() => {
        navigate('/');
      });
  }, [username, navigate]);

  const onToggleFollowing = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  if (!profile) {
    return null;
  }

  const listConfig: ArticleListConfig = isFavorites
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
              {!isUser && <FollowButton profile={profile} onToggle={onToggleFollowing} />}
              {isUser && (
                <Link to="/settings" className="btn btn-sm btn-outline-secondary action-btn">
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
                    className={`nav-link ${!isFavorites ? 'active' : ''}`}
                    to={`/profile/${profile.username}`}
                  >
                    My Posts
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${isFavorites ? 'active' : ''}`}
                    to={`/profile/${profile.username}/favorites`}
                  >
                    Favorited Posts
                  </Link>
                </li>
              </ul>
            </div>

            <ArticleList config={listConfig} limit={10} />
          </div>
        </div>
      </div>
    </div>
  );
}

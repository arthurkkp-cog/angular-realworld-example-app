import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FollowButton } from '../components/FollowButton';
import { profileService } from '../services/profile';
import { Profile as ProfileType } from '../types';

export function Profile() {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState<ProfileType | null>(null);

  const isUser = currentUser?.username === profile?.username;
  const isFavoritesTab = location.pathname.endsWith('/favorites');

  useEffect(() => {
    if (username) {
      profileService
        .get(username)
        .then(setProfile)
        .catch(() => {});
    }
  }, [username]);

  const handleToggleFollowing = (updatedProfile: ProfileType) => {
    setProfile(updatedProfile);
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="user-info">
        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <img src={profile.image} className="user-img" alt={profile.username} />
              <h4>{profile.username}</h4>
              <p>{profile.bio}</p>
              {!isUser && <FollowButton profile={profile} onToggle={handleToggleFollowing} />}
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
                  <Link className={`nav-link ${!isFavoritesTab ? 'active' : ''}`} to={`/profile/${profile.username}`}>
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

            <Outlet context={{ username: profile.username }} />
          </div>
        </div>
      </div>
    </div>
  );
}

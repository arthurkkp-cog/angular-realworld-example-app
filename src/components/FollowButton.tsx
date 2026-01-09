import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profile';
import { Profile } from '../types';

interface FollowButtonProps {
  profile: Profile;
  onToggle: (profile: Profile) => void;
}

export function FollowButton({ profile, onToggle }: FollowButtonProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedProfile: Profile;
      if (!profile.following) {
        updatedProfile = await profileService.follow(profile.username);
      } else {
        updatedProfile = await profileService.unfollow(profile.username);
      }
      onToggle(updatedProfile);
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className={`btn btn-sm action-btn ${
        profile.following ? 'btn-secondary' : 'btn-outline-secondary'
      } ${isSubmitting ? 'disabled' : ''}`}
      onClick={handleClick}
      disabled={isSubmitting}
    >
      <i className="ion-plus-round"></i>
      &nbsp;
      {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
    </button>
  );
}

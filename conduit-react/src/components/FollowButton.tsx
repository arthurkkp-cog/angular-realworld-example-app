import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { profileService } from '../services/profileService';
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
      if (profile.following) {
        const updatedProfile = await profileService.unfollow(profile.username);
        onToggle(updatedProfile);
      } else {
        const updatedProfile = await profileService.follow(profile.username);
        onToggle(updatedProfile);
      }
    } catch {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttonClass = `btn btn-sm action-btn ${
    isSubmitting ? 'disabled' : ''
  } ${profile.following ? 'btn-secondary' : 'btn-outline-secondary'}`;

  return (
    <button className={buttonClass} onClick={handleClick} disabled={isSubmitting}>
      <i className="ion-plus-round"></i>
      &nbsp;
      {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
    </button>
  );
}

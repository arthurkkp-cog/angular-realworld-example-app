import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FollowButton } from './FollowButton';
import { AuthProvider } from '../features/auth/AuthContext';
import { profileService } from '../services/profileService';
import { userService } from '../services/userService';
import { mockProfile, mockUser } from '../test/mocks';

vi.mock('../services/profileService', () => ({
  profileService: {
    follow: vi.fn(),
    unfollow: vi.fn(),
  },
}));

vi.mock('../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderFollowButton(profile = mockProfile, onToggle = vi.fn()) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <FollowButton profile={profile} onToggle={onToggle} />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('FollowButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render Follow button when not following', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderFollowButton({ ...mockProfile, following: false });

    await waitFor(() => {
      expect(screen.getByText(/Follow/)).toBeInTheDocument();
    });
  });

  it('should render Unfollow button when following', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    renderFollowButton({ ...mockProfile, following: true });

    await waitFor(() => {
      expect(screen.getByText(/Unfollow/)).toBeInTheDocument();
    });
  });

  it('should display username in button', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderFollowButton();

    await waitFor(() => {
      expect(screen.getByText(new RegExp(mockProfile.username))).toBeInTheDocument();
    });
  });

  it('should call follow when clicking Follow button', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(profileService.follow).mockResolvedValue({ ...mockProfile, following: true });

    const onToggle = vi.fn();
    renderFollowButton({ ...mockProfile, following: false }, onToggle);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(profileService.follow).toHaveBeenCalledWith(mockProfile.username);
    });
  });

  it('should call unfollow when clicking Unfollow button', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(profileService.unfollow).mockResolvedValue({ ...mockProfile, following: false });

    const onToggle = vi.fn();
    renderFollowButton({ ...mockProfile, following: true }, onToggle);

    await waitFor(() => {
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(profileService.unfollow).toHaveBeenCalledWith(mockProfile.username);
    });
  });
});

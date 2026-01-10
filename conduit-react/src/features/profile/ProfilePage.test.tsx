import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProfilePage } from './ProfilePage';
import { AuthProvider } from '../auth/AuthContext';
import { profileService } from '../../services/profileService';
import { articleService } from '../../services/articleService';
import { userService } from '../../services/userService';
import { mockProfile, mockArticle, mockUser } from '../../test/mocks';

vi.mock('../../services/profileService', () => ({
  profileService: {
    getProfile: vi.fn(),
    follow: vi.fn(),
    unfollow: vi.fn(),
  },
}));

vi.mock('../../services/articleService', () => ({
  articleService: {
    getArticles: vi.fn(),
  },
}));

vi.mock('../../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderProfilePage(username = 'testuser', favorites = false) {
  const path = favorites ? `/profile/${username}/favorites` : `/profile/${username}`;
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <Routes>
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/profile/:username/favorites" element={<ProfilePage />} />
          <Route path="/settings" element={<div>Settings Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile);
    vi.mocked(articleService.getArticles).mockResolvedValue({
      articles: [mockArticle],
      articlesCount: 1,
    });
  });

  it('should render profile username', async () => {
    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
    });
  });

  it('should render profile bio', async () => {
    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.bio)).toBeInTheDocument();
    });
  });

  it('should render profile image', async () => {
    renderProfilePage();

    await waitFor(() => {
      const profileImg = document.querySelector('.user-img');
      expect(profileImg).toHaveAttribute('src', mockProfile.image);
    });
  });

  it('should render My Posts tab', async () => {
    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText('My Posts')).toBeInTheDocument();
    });
  });

  it('should render Favorited Posts tab', async () => {
    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText('Favorited Posts')).toBeInTheDocument();
    });
  });

  it('should show Edit Profile Settings button when viewing own profile', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: mockProfile.username,
    });

    renderProfilePage(mockProfile.username);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile Settings')).toBeInTheDocument();
    });
  });

  it('should show Follow button when viewing other profile', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: 'differentuser',
    });

    renderProfilePage(mockProfile.username);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Follow ${mockProfile.username}`))).toBeInTheDocument();
    });
  });

  it('should render articles', async () => {
    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText(mockArticle.title)).toBeInTheDocument();
    });
  });

  it('should have link to favorited articles tab', async () => {
    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText('Favorited Posts')).toBeInTheDocument();
    });

    const favoritedLink = screen.getByText('Favorited Posts').closest('a');
    expect(favoritedLink).toHaveAttribute('href', `/profile/${mockProfile.username}/favorites`);
  });

  it('should call follow when Follow button is clicked', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: 'differentuser',
    });
    vi.mocked(profileService.follow).mockResolvedValue({ ...mockProfile, following: true });

    renderProfilePage(mockProfile.username);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Follow ${mockProfile.username}`))).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(new RegExp(`Follow ${mockProfile.username}`)));

    await waitFor(() => {
      expect(profileService.follow).toHaveBeenCalledWith(mockProfile.username);
    });
  });

  it('should show Unfollow button when already following', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue({
      ...mockUser,
      username: 'differentuser',
    });
    vi.mocked(profileService.getProfile).mockResolvedValue({
      ...mockProfile,
      following: true,
    });

    renderProfilePage(mockProfile.username);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`Unfollow ${mockProfile.username}`))).toBeInTheDocument();
    });
  });

  it('should handle profile without bio', async () => {
    vi.mocked(profileService.getProfile).mockResolvedValue({
      ...mockProfile,
      bio: '',
    });

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
    });
  });

  it('should handle profile without image', async () => {
    vi.mocked(profileService.getProfile).mockResolvedValue({
      ...mockProfile,
      image: '',
    });

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
    });
  });

  it('should show active state on Favorited Posts tab when on favorites page', async () => {
    renderProfilePage(mockProfile.username, true);

    await waitFor(() => {
      const favoritedLink = screen.getByText('Favorited Posts').closest('a');
      expect(favoritedLink).toHaveClass('active');
    });
  });

  it('should show active state on My Posts tab when on main profile page', async () => {
    renderProfilePage(mockProfile.username, false);

    await waitFor(() => {
      const myPostsLink = screen.getByText('My Posts').closest('a');
      expect(myPostsLink).toHaveClass('active');
    });
  });

  it('should fetch articles on favorites tab', async () => {
    renderProfilePage(mockProfile.username, true);

    await waitFor(() => {
      expect(articleService.getArticles).toHaveBeenCalled();
    });
  });

  it('should fetch articles on main profile page', async () => {
    renderProfilePage(mockProfile.username, false);

    await waitFor(() => {
      expect(articleService.getArticles).toHaveBeenCalled();
    });
  });
});

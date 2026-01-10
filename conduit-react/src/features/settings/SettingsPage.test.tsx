import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SettingsPage } from './SettingsPage';
import { AuthProvider } from '../auth/AuthContext';
import { userService } from '../../services/userService';
import { mockUser } from '../../test/mocks';

vi.mock('../../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
    updateUser: vi.fn(),
  },
}));

function renderSettingsPage() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <AuthProvider>
        <Routes>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/profile/:username" element={<div>Profile Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
  });

  it('should render settings form', async () => {
    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Your Settings')).toBeInTheDocument();
    });
  });

  it('should render all form fields', async () => {
    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('URL of profile picture')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Short bio about you')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('New Password')).toBeInTheDocument();
    });
  });

  it('should pre-populate form with user data', async () => {
    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('URL of profile picture')).toHaveValue(mockUser.image);
      expect(screen.getByPlaceholderText('Username')).toHaveValue(mockUser.username);
      expect(screen.getByPlaceholderText('Short bio about you')).toHaveValue(mockUser.bio);
      expect(screen.getByPlaceholderText('Email')).toHaveValue(mockUser.email);
    });
  });

  it('should call updateUser on form submit', async () => {
    vi.mocked(userService.updateUser).mockResolvedValue({
      ...mockUser,
      username: 'updateduser',
    });

    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toHaveValue(mockUser.username);
    });

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'updateduser' },
    });
    fireEvent.click(screen.getByText('Update Settings'));

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith({
        image: mockUser.image,
        username: 'updateduser',
        bio: mockUser.bio,
        email: mockUser.email,
      });
    });
  });

  it('should render logout button', async () => {
    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Or click here to logout.')).toBeInTheDocument();
    });
  });

  it('should logout when logout button is clicked', async () => {
    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Or click here to logout.')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Or click here to logout.'));

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('jwtToken');
    });
  });

  it('should display errors on failed update', async () => {
    vi.mocked(userService.updateUser).mockRejectedValue({
      errors: { username: 'has already been taken' },
    });

    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toHaveValue(mockUser.username);
    });

    fireEvent.change(screen.getByPlaceholderText('Username'), {
      target: { value: 'takenuser' },
    });
    fireEvent.click(screen.getByText('Update Settings'));

    await waitFor(() => {
      expect(screen.getByText('username has already been taken')).toBeInTheDocument();
    });
  });

  it('should include password in update when provided', async () => {
    vi.mocked(userService.updateUser).mockResolvedValue({
      ...mockUser,
    });

    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toHaveValue(mockUser.username);
    });

    fireEvent.change(screen.getByPlaceholderText('New Password'), {
      target: { value: 'newpassword123' },
    });
    fireEvent.click(screen.getByText('Update Settings'));

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith({
        image: mockUser.image,
        username: mockUser.username,
        bio: mockUser.bio,
        email: mockUser.email,
        password: 'newpassword123',
      });
    });
  });

  it('should handle user being null initially', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    renderSettingsPage();

    await waitFor(() => {
      expect(screen.getByText('Your Settings')).toBeInTheDocument();
    });
  });
});

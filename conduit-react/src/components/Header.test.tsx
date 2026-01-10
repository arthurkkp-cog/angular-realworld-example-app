import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { AuthProvider } from '../features/auth/AuthContext';
import { userService } from '../services/userService';
import { mockUser } from '../test/mocks';

vi.mock('../services/userService', () => ({
  userService: {
    getCurrentUser: vi.fn(),
  },
}));

function renderHeader(initialRoute = '/') {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Header />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should render logo link', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderHeader();

    expect(screen.getByText('conduit')).toBeInTheDocument();
  });

  it('should render Home link', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderHeader();

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should render Sign in and Sign up links when not authenticated', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderHeader();

    expect(screen.getByText('Sign in')).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('should render authenticated navigation when user is logged in', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    renderHeader();

    await screen.findByText('New Article');

    expect(screen.getByText('New Article')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText(mockUser.username)).toBeInTheDocument();
  });

  it('should have correct href for logo', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderHeader();

    const logoLink = screen.getByText('conduit').closest('a');
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should have correct href for Sign in link', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderHeader();

    const signInLink = screen.getByText('Sign in').closest('a');
    expect(signInLink).toHaveAttribute('href', '/login');
  });

  it('should have correct href for Sign up link', () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    renderHeader();

    const signUpLink = screen.getByText('Sign up').closest('a');
    expect(signUpLink).toHaveAttribute('href', '/register');
  });
});

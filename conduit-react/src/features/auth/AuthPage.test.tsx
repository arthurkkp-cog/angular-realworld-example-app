import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthPage } from './AuthPage';
import { AuthProvider } from './AuthContext';
import { userService } from '../../services/userService';
import { mockUser } from '../../test/mocks';

vi.mock('../../services/userService', () => ({
  userService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

function HomePage() {
  return <div>Home Page</div>;
}

function renderAuthPage(route = '/login') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(localStorage.getItem).mockReturnValue(null);
  });

  describe('Login mode', () => {
    it('should render Sign in title', () => {
      renderAuthPage('/login');

      expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    });

    it('should render email and password fields', () => {
      renderAuthPage('/login');

      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should not render username field', () => {
      renderAuthPage('/login');

      expect(screen.queryByPlaceholderText('Username')).not.toBeInTheDocument();
    });

    it('should render Need an account link', () => {
      renderAuthPage('/login');

      expect(screen.getByText('Need an account?')).toBeInTheDocument();
    });

    it('should call login on form submit', async () => {
      vi.mocked(userService.login).mockResolvedValue(mockUser);

      renderAuthPage('/login');

      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

      await waitFor(() => {
        expect(userService.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('Register mode', () => {
    it('should render Sign up title', () => {
      renderAuthPage('/register');

      expect(screen.getByRole('heading', { name: 'Sign up' })).toBeInTheDocument();
    });

    it('should render username, email and password fields', () => {
      renderAuthPage('/register');

      expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('should render Have an account link', () => {
      renderAuthPage('/register');

      expect(screen.getByText('Have an account?')).toBeInTheDocument();
    });

    it('should call register on form submit', async () => {
      vi.mocked(userService.register).mockResolvedValue(mockUser);

      renderAuthPage('/register');

      fireEvent.change(screen.getByPlaceholderText('Username'), {
        target: { value: 'testuser' },
      });
      fireEvent.change(screen.getByPlaceholderText('Email'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('Password'), {
        target: { value: 'password123' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

      await waitFor(() => {
        expect(userService.register).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        });
      });
    });
  });

  it('should display errors on failed login', async () => {
    vi.mocked(userService.login).mockRejectedValue({
      errors: { 'email or password': 'is invalid' },
    });

    renderAuthPage('/login');

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(screen.getByText('email or password is invalid')).toBeInTheDocument();
    });
  });
});

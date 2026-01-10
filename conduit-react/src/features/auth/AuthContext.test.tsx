import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { userService } from '../../services/userService';
import { mockUser } from '../../test/mocks';

vi.mock('../../services/userService', () => ({
  userService: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    updateUser: vi.fn(),
  },
}));

function TestComponent() {
  const { user, isAuthenticated, isLoading, login, register, logout, updateUser } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading.toString()}</span>
      <span data-testid="authenticated">{isAuthenticated.toString()}</span>
      <span data-testid="username">{user?.username || 'none'}</span>
      <button onClick={() => login({ email: 'test@example.com', password: 'password' })}>Login</button>
      <button onClick={() => register({ username: 'test', email: 'test@example.com', password: 'password' })}>
        Register
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateUser({ bio: 'new bio' })}>Update</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should provide initial state with no user', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(screen.getByTestId('username').textContent).toBe('none');
  });

  it('should load user from token on mount', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('username').textContent).toBe('testuser');
  });

  it('should handle login', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(userService.login).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('jwtToken', mockUser.token);
  });

  it('should handle register', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue(null);
    vi.mocked(userService.register).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    await act(async () => {
      screen.getByText('Register').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('jwtToken', mockUser.token);
  });

  it('should handle logout', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    await act(async () => {
      screen.getByText('Logout').click();
    });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(localStorage.removeItem).toHaveBeenCalledWith('jwtToken');
  });

  it('should handle updateUser', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('test-token');
    vi.mocked(userService.getCurrentUser).mockResolvedValue(mockUser);
    vi.mocked(userService.updateUser).mockResolvedValue({ ...mockUser, bio: 'new bio' });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });

    await act(async () => {
      screen.getByText('Update').click();
    });

    expect(userService.updateUser).toHaveBeenCalledWith({ bio: 'new bio' });
  });

  it('should clear token on getCurrentUser error', async () => {
    vi.mocked(localStorage.getItem).mockReturnValue('invalid-token');
    vi.mocked(userService.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('jwtToken');
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<TestComponent />)).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ListErrors } from './ListErrors';
import { Errors } from '../types';

describe('ListErrors', () => {
  it('should render nothing when errors is null', () => {
    const { container } = render(<ListErrors errors={null} />);

    expect(container.firstChild).toBeNull();
  });

  it('should render error messages', () => {
    const errors: Errors = {
      errors: {
        email: 'is invalid',
        password: 'is too short',
      },
    };

    render(<ListErrors errors={errors} />);

    expect(screen.getByText('email is invalid')).toBeInTheDocument();
    expect(screen.getByText('password is too short')).toBeInTheDocument();
  });

  it('should render errors as list items', () => {
    const errors: Errors = {
      errors: {
        username: 'is already taken',
      },
    };

    render(<ListErrors errors={errors} />);

    const listItem = screen.getByText('username is already taken');
    expect(listItem.tagName).toBe('LI');
  });

  it('should render multiple errors for same field', () => {
    const errors: Errors = {
      errors: {
        body: 'cannot be blank',
      },
    };

    render(<ListErrors errors={errors} />);

    expect(screen.getByText('body cannot be blank')).toBeInTheDocument();
  });
});

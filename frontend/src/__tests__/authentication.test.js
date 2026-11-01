import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Authentication Component', () => {
  test('renders correctly', () => {
    render(<Authentication />);
    expect(screen.getByTestId('authentication-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const mockFetch = global.fetch;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue({ token: 'test-token' }),
    });

    render(<Authentication />);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole('button', { name: /log in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(loginButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledWith(
      'https://api.ainative.studio/api/v1/auth',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      })
    ));
  });

  test('shows loading state', async () => {
    const mockFetch = global.fetch;
    mockFetch.mockImplementationOnce(() => new Promise(() => {}));

    render(<Authentication />);
    const loginButton = screen.getByRole('button', { name: /log in/i });
    await userEvent.click(loginButton);

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    const mockFetch = global.fetch;
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Invalid credentials',
    });

    render(<Authentication />);
    const loginButton = screen.getByRole('button', { name: /log in/i });
    await userEvent.click(loginButton);

    await waitFor(() => expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument());
  });

  test('is accessible', () => {
    const { container } = render(<Authentication />);
    expect(container).toHaveAccessibleName('Authentication');
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-label', 'Email');
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-label', 'Password');
    expect(screen.getByRole('button', { name: /log in/i })).toBeEnabled();
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('../components/LinkDeletion.js', () => ({
  LinkDeletion: ({ onConfirm }) => (
    <div data-testid="link_deletion-container">
      <button data-testid="delete-button" onClick={onConfirm}>Delete</button>
      <p data-testid="loading-message" style={{ display: 'none' }}>Loading...</p>
      <p data-testid="error-message" style={{ display: 'none' }}>Error deleting link.</p>
    </div>
  ),
}));

const originalFetch = global.fetch;

describe('LinkDeletion Component', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    render(<LinkDeletion onConfirm={() => {}} />);
    expect(screen.getByTestId('link_deletion-container')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('handles user interactions', async () => {
    const handleConfirm = jest.fn();
    render(<LinkDeletion onConfirm={handleConfirm} />);

    mockFetch.mockResolvedValueOnce({ ok: true });
    userEvent.click(screen.getByTestId('delete-button'));

    await waitFor(() => expect(handleConfirm).toHaveBeenCalled());
  });

  it('shows loading state', async () => {
    render(<LinkDeletion onConfirm={() => {}} />);

    mockFetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    userEvent.click(screen.getByTestId('delete-button'));

    expect(screen.getByTestId('loading-message').style.display).toBe('');
    await waitFor(() => expect(screen.getByTestId('loading-message').style.display).toBe('none'));
  });

  it('handles API errors', async () => {
    render(<LinkDeletion onConfirm={() => {}} />);

    mockFetch.mockResolvedValueOnce({ ok: false, statusText: 'API Error' });
    userEvent.click(screen.getByTestId('delete-button'));

    await waitFor(() => expect(screen.getByTestId('error-message').style.display).toBe(''));
  });

  it('is accessible', () => {
    render(<LinkDeletion onConfirm={() => {}} />);
    expect(screen.getByTestId('delete-button')).toHaveAttribute('aria-label', 'Delete link');
  });
});
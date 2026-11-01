import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

describe('LinkSaving Component', () => {
  const mockFetch = global.fetch;

  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly', () => {
    render(<LinkSaving />);
    expect(screen.getByTestId('link_saving-container')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save link/i })).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    render(<LinkSaving />);
    const titleInput = screen.getByLabelText(/title/i);
    const urlInput = screen.getByLabelText(/url/i);
    const saveButton = screen.getByRole('button', { name: /save link/i });

    userEvent.type(titleInput, 'Test Title');
    userEvent.type(urlInput, 'http://test.com');
    userEvent.click(saveButton);

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(1));
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.ainative.studio',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'X-API-Key': 'your-api-key' }),
        body: JSON.stringify({ title: 'Test Title', url: 'http://test.com' }),
      })
    );
  });

  test('shows loading state', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    render(<LinkSaving />);
    const saveButton = screen.getByRole('button', { name: /save link/i });

    userEvent.click(saveButton);
    expect(screen.getByText(/saving.../i)).toBeInTheDocument();

    await waitFor(() => expect(screen.queryByText(/saving.../i)).not.toBeInTheDocument());
  });

  test('handles API errors', async () => {
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('API error')));
    render(<LinkSaving />);
    const saveButton = screen.getByRole('button', { name: /save link/i });

    userEvent.click(saveButton);
    await waitFor(() => expect(screen.getByText(/error saving link/i)).toBeInTheDocument());
  });

  test('is accessible', async () => {
    render(<LinkSaving />);
    const titleInput = screen.getByLabelText(/title/i);
    const urlInput = screen.getByLabelText(/url/i);
    const saveButton = screen.getByRole('button', { name: /save link/i });

    expect(titleInput).toHaveAttribute('aria-required', 'true');
    expect(urlInput).toHaveAttribute('aria-required', 'true');
    expect(saveButton).toBeEnabled();
    expect(saveButton).toHaveAttribute('aria-label', /save link/i);
  });
});
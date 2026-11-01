import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

const mockTags = ['React', 'Testing', 'Library'];
const mockBookmarks = [
  { id: 1, title: 'Bookmark 1', url: 'http://example.com/1', tags: [] },
  { id: 2, title: 'Bookmark 2', url: 'http://example.com/2', tags: [] }
];

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('Tagging Component', () => {
  test('renders correctly', async () => {
    window.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockTags)
    });

    render(<Tagging />);
    await waitFor(() => expect(screen.getByTestId('tagging-container')).toBeInTheDocument());
    expect(screen.getByText(/Add Tags/i)).toBeInTheDocument();
  });

  test('handles user interactions to add a tag', async () => {
    window.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockTags)
    }).mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue({ success: true })
    });

    render(<Tagging />);
    await waitFor(() => expect(screen.getByTestId('tagging-container')).toBeInTheDocument());

    const inputElement = screen.getByRole('textbox');
    await userEvent.type(inputElement, 'NewTag{enter}');

    expect(window.fetch).toHaveBeenCalledTimes(2);
    expect(window.fetch).toHaveBeenCalledWith(
      'https://api.ainative.studio/api/v1/bookmarks/tags',
      expect.anything()
    );
  });

  test('shows loading state when fetching tags', () => {
    window.fetch.mockImplementation(() => new Promise(() => {}));

    render(<Tagging />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('handles API errors when fetching tags', async () => {
    window.fetch.mockRejectedValue(new Error('API Error'));

    render(<Tagging />);
    await waitFor(() => expect(screen.getByText(/Error loading tags/i)).toBeInTheDocument());
  });

  test('is accessible', async () => {
    window.fetch.mockResolvedValueOnce({
      json: jest.fn().mockResolvedValue(mockTags)
    });

    render(<Tagging />);
    await waitFor(() => expect(screen.getByTestId('tagging-container')).toBeInTheDocument());

    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Add Tags');
    expect(screen.getAllByRole('button')[0]).toHaveAttribute('aria-label', 'Remove Tag');
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookmarkListing from '../components/BookmarkListing';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('BookmarkListing Component', () => {
  test('renders correctly when bookmarks are loaded', async () => {
    const mockBookmarks = [
      { id: 1, title: 'Example 1', url: 'http://example1.com', tags: ['tag1'] },
      { id: 2, title: 'Example 2', url: 'http://example2.com', tags: ['tag2'] },
    ];
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBookmarks),
      ok: true,
    });

    render(<BookmarkListing />);
    await waitFor(() => {
      expect(screen.getByText('Example 1')).toBeInTheDocument();
      expect(screen.getByText('Example 2')).toBeInTheDocument();
    });
  });

  test('shows loading state while fetching bookmarks', () => {
    render(<BookmarkListing />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue({ error: 'Failed to load bookmarks' }),
      ok: false,
    });

    render(<BookmarkListing />);
    await waitFor(() => {
      expect(screen.getByText(/failed to load bookmarks/i)).toBeInTheDocument();
    });
  });

  test('filters bookmarks by tag', async () => {
    const mockBookmarks = [
      { id: 1, title: 'Example 1', url: 'http://example1.com', tags: ['tag1'] },
      { id: 2, title: 'Example 2', url: 'http://example2.com', tags: ['tag2'] },
      { id: 3, title: 'Example 3', url: 'http://example3.com', tags: ['tag1', 'tag2'] },
    ];
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBookmarks),
      ok: true,
    });

    render(<BookmarkListing />);
    await waitFor(() => {
      expect(screen.getByText('Example 1')).toBeInTheDocument();
      expect(screen.getByText('Example 2')).toBeInTheDocument();
      expect(screen.getByText('Example 3')).toBeInTheDocument();
    });

    userEvent.type(screen.getByRole('textbox'), 'tag1');
    await waitFor(() => {
      expect(screen.getByText('Example 1')).toBeInTheDocument();
      expect(screen.getByText('Example 3')).toBeInTheDocument();
      expect(screen.queryByText('Example 2')).not.toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    const mockBookmarks = [
      { id: 1, title: 'Example 1', url: 'http://example1.com', tags: ['tag1'] },
    ];
    global.fetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(mockBookmarks),
      ok: true,
    });

    render(<BookmarkListing />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveAccessibleName('Bookmarks');
      expect(screen.getByRole('textbox', { name: /filter by tag/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /example 1/i })).toHaveAttribute('href', 'http://example1.com');
    });
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('node-fetch', () => jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('FilterByTag Component', () => {
  test('renders correctly', () => {
    render(<FilterByTag />);
    const container = screen.getByTestId('filter_by_tag-container');
    expect(container).toBeInTheDocument();
  });

  test('handles user interactions', async () => {
    const mockFetch = jest.requireMock('node-fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue(['tag1', 'tag2', 'tag3']),
    });
    render(<FilterByTag />);
    const inputElement = screen.getByRole('textbox');
    await userEvent.type(inputElement, 'tag1');
    expect(mockFetch).toHaveBeenCalledWith('https://api.ainative.studio/api/v1/tags', {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.REACT_APP_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  });

  test('shows loading state', async () => {
    jest.requireMock('node-fetch').mockImplementationOnce(() => new Promise(() => {}));
    render(<FilterByTag />);
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('handles API errors', async () => {
    jest.requireMock('node-fetch').mockRejectedValue(new Error('API Error'));
    render(<FilterByTag />);
    await waitFor(() => {
      const errorElement = screen.getByText(/error loading tags/i);
      expect(errorElement).toBeInTheDocument();
    });
  });

  test('is accessible', async () => {
    jest.requireMock('node-fetch').mockResolvedValue({
      json: jest.fn().mockResolvedValue(['tag1', 'tag2', 'tag3']),
    });
    render(<FilterByTag />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveAttribute('aria-label', 'filter by tag');
  });
});
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AINativeProvider } from '@ainative/react-sdk';
import LoginPage from './components/LoginPage';
import BookmarkList from './components/BookmarkList';
import AddBookmark from './components/AddBookmark';
import FilterBookmarks from './components/FilterBookmarks';

const App = () => {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('ainative_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setAuthLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('https://api.ainative.studio/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('ainative_token', data.access_token);
        setIsAuthenticated(true);
      } else {
        console.error('Login failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ainative_token');
    setIsAuthenticated(false);
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AINativeProvider apiKey={process.env.REACT_APP_AINATIVE_API_KEY || ''}>
      <Router>
        <header className="bg-dark-navy text-white p-4">
          <nav className="flex justify-between items-center">
            <h1 className="text-2xl">Link Bookmark App</h1>
            <div className="space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/bookmarks" className="text-white hover:text-gray-300">Bookmarks</Link>
                  <Link to="/add-bookmark" className="text-white hover:text-gray-300">Add Bookmark</Link>
                  <button onClick={handleLogout} className="text-white hover:text-gray-300">Logout</button>
                </>
              ) : (
                <Link to="/login" className="text-white hover:text-gray-300">Login</Link>
              )}
            </div>
          </nav>
        </header>
        <main className="p-4">
          <Routes>
            {!isAuthenticated && (
              <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            )}
            {isAuthenticated && (
              <>
                <Route path="/bookmarks" element={<BookmarkList />} />
                <Route path="/add-bookmark" element={<AddBookmark />} />
                <Route path="/filter-by-tag" element={<FilterBookmarks />} />
                <Route path="*" element={<Navigate to="/bookmarks" />} />
              </>
            )}
            {!isAuthenticated && (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </main>
      </Router>
    </AINativeProvider>
  );
};

export default App;
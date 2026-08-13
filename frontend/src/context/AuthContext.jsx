import { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI } from '../services/api';

const AuthContext = createContext(null);

// ── Helpers: keep user cached in localStorage ─────────────────────────────────
const STORAGE_KEY = 'auth_user';

const loadCachedUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveUser = (u) => {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else localStorage.removeItem(STORAGE_KEY);
};

/**
 * Provides authentication state (user, token) and actions (login, logout, updateUser)
 * to the entire app.
 *
 * Strategy:
 *  1. Immediately load the cached user from localStorage → sidebar renders with
 *     the correct role on refresh (no flash of missing admin links).
 *  2. Re-validate with GET /profile in the background and update if needed.
 */
export const AuthProvider = ({ children }) => {
  // Seed state from cache — prevents the admin-links-missing flash on refresh
  const [user, setUser]       = useState(loadCachedUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      saveUser(null);
      setUser(null);
      setLoading(false);
      return;
    }

    // Background re-validation
    profileAPI.get()
      .then(({ data }) => {
        setUser(data.user);
        saveUser(data.user);          // keep cache fresh
      })
      .catch(() => {
        localStorage.removeItem('token');
        saveUser(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    saveUser(userData);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    saveUser(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

import { createContext, useContext, useState, useEffect } from 'react';
import { profileAPI } from '../services/api';

const AuthContext = createContext(null);

// ── Persist user in localStorage so role is available on first paint ──────────
const STORAGE_KEY = 'auth_user';

const loadCachedUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const saveUser = (u) => {
  if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  else    localStorage.removeItem(STORAGE_KEY);
};

/**
 * AuthProvider — authentication state for the whole app.
 *
 * Two-phase strategy:
 *  Phase 1 (synchronous, instant):
 *    Read cached user + token from localStorage → correct role on first paint,
 *    no flash of missing admin links.
 *
 *  Phase 2 (async, background):
 *    Re-validate with GET /profile.
 *    • 401 → token is truly invalid → clear session.
 *    • Network / server error → backend may be sleeping → keep cache, don't clear.
 *    • Success → refresh cache with latest profile data.
 */
export const AuthProvider = ({ children }) => {
  const cachedUser              = loadCachedUser();
  const hasToken                = !!localStorage.getItem('token');

  // Start loading=false if we already have cached data (no need to block the UI)
  const [user, setUser]         = useState(cachedUser);
  const [loading, setLoading]   = useState(!cachedUser && hasToken);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      saveUser(null);
      setUser(null);
      setLoading(false);
      return;
    }

    profileAPI.get()
      .then(({ data }) => {
        setUser(data.user);
        saveUser(data.user);
      })
      .catch((err) => {
        // Only kill the session on a definitive 401 Unauthorized.
        // Network errors, 5xx, timeouts (backend sleeping on free tier) → keep cache.
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          saveUser(null);
          setUser(null);
        }
        // For any other error, keep the cached user so the sidebar stays intact.
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
    <AuthContext.Provider
      value={{ user, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

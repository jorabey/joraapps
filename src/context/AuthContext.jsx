import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getAccessToken, refreshAccessToken, setAccessToken } from '../api/client';
import { userApi } from '../api/user';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | authenticated | guest

  const loadUser = useCallback(async () => {
    try {
      const { data } = await userApi.getMe();
      setUser(data.user);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setStatus('guest');
    }
  }, []);

  useEffect(() => {
    (async () => {
      if (getAccessToken()) {
        await loadUser();
        return;
      }
      try {
        await refreshAccessToken();
        await loadUser();
      } catch {
        setStatus('guest');
      }
    })();
  }, [loadUser]);

  const login = useCallback(async (identifier, password) => {
    const data = await authApi.login(identifier, password);
    setUser(data.user);
    setStatus('authenticated');
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    setUser(data.user);
    setStatus('authenticated');
    return data;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setAccessToken(null);
    setStatus('guest');
    localStorage.removeItem("ultra_secure_mode");
    localStorage.removeItem("secure_pin");
    localStorage.removeItem("secure_pin_length");
    localStorage.removeItem("setItem");

  }, []);

  const refreshMe = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const updateUserLocal = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, login, register, logout, refreshMe, updateUserLocal }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

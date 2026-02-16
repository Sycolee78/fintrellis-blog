import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  refreshToken,
  getMe,
} from "../api/auth";
import { configureAuth } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef(null);

  // Wire up client interceptor to read token from ref
  useEffect(() => {
    configureAuth({
      getToken: () => accessTokenRef.current,
      onRefresh: (newToken) => {
        accessTokenRef.current = newToken;
      },
      onFailure: () => {
        accessTokenRef.current = null;
        setUser(null);
      },
    });
  }, []);

  // On mount, try to refresh the session via cookie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await refreshToken();
        if (cancelled) return;
        accessTokenRef.current = res.data.access;
        const meRes = await getMe();
        if (!cancelled) setUser(meRes.data);
      } catch {
        if (!cancelled) {
          accessTokenRef.current = null;
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loginUser = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password });
    accessTokenRef.current = res.data.access;
    setUser(res.data.user);
    return res.data;
  }, []);

  const registerUser = useCallback(async (data) => {
    const res = await apiRegister(data);
    accessTokenRef.current = res.data.access;
    setUser(res.data.user);
    return res.data;
  }, []);

  const logoutUser = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // ignore — clear state regardless
    }
    accessTokenRef.current = null;
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    loginUser,
    registerUser,
    logoutUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

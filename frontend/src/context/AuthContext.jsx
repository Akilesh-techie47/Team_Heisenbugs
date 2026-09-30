import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => api.auth.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

  // Validate session with authoritative backend on startup
  useEffect(() => {
    let isMounted = true;
    const verifyUserSession = async () => {
      const serverVerifiedUser = await api.auth.getMe();
      if (isMounted) {
        if (serverVerifiedUser) {
          setCurrentUser(serverVerifiedUser);
        } else {
          // If server rejects token, clear state
          setCurrentUser(null);
        }
      }
    };

    verifyUserSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setCurrentUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await api.auth.adminLogin(email, password);
      setCurrentUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Admin login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(userData);
      setCurrentUser(res.data.user);
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Derive role strictly from server-authenticated user record
  const roleNormalized = (currentUser?.role || 'user').toLowerCase();
  const isAdmin = roleNormalized === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: roleNormalized,
        isAdmin,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        adminLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

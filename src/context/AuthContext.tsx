import { createContext, ReactNode, useContext, useMemo, useState, useEffect } from 'react';
import authService from '../services/auth/authService';

import { Role } from '../common/enums/role.enum';
import { getRoleFromToken } from '../utils/jwt';

const normalizeRole = (roleValue?: Role | string | null): Role | string => {
  if (!roleValue) {
    return Role.SUPER_ADMIN;
  }

  return String(roleValue).toUpperCase().replace(/\s+/g, '_').trim();
};

type User = {
  id: string;
  email: string;
  name?: string;
  role?: Role | string;
};

type AuthContextValue = {
  isAuthenticated: boolean;
  user: User | null;
  role: Role | string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const token = authService.getToken();
          const tokenRole = getRoleFromToken(token);

          const response = await authService.verifyAuth();
          if (response.success && response.user) {
            // Normalize role - prefer user.role, then token role, default to SUPER_ADMIN
            const rawRole = (response.user.role as Role | string | undefined) ||
              (tokenRole as Role | string | null) ||
              Role.SUPER_ADMIN;
            const userRole = normalizeRole(rawRole);
            setIsAuthenticated(true);
            setUser({ ...response.user, role: userRole });
            setRole(userRole);
          } else {
            setIsAuthenticated(false);
            setUser(null);
            setRole(null);
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      if (response.success && response.user && response.token) {
        const token = response.token;
        const tokenRole = getRoleFromToken(token);
        
        // Normalize role - prefer user.role, then roleName, then token role, default to SUPER_ADMIN
        const rawRole = (response.user.role as Role | string | undefined) ||
          ((response.user as any).roleName as Role | string | undefined) ||
          (tokenRole as Role | string | null) ||
          Role.SUPER_ADMIN;
        const userRole = normalizeRole(rawRole);

        // Debug logging (remove in production)
        if (process.env.NODE_ENV === 'development') {
          console.log('[AuthContext] Login successful:', {
            userRole: response.user.role,
            roleName: (response.user as any).roleName,
            tokenRole: tokenRole,
            normalizedRole: userRole,
          });
        }

        setIsAuthenticated(true);
        setUser({ ...response.user, role: userRole });
        setRole(userRole);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ email, password });
      if (response.success && response.user && response.token) {
        const token = response.token;
        const tokenRole = getRoleFromToken(token);
        // Normalize role - prefer user.role, then token role, default to SUPER_ADMIN
        const rawRole = (response.user.role as Role | string | null | undefined) ||
          (tokenRole as Role | string | null) ||
          Role.SUPER_ADMIN;
        const userRole = normalizeRole(rawRole);

        setIsAuthenticated(true);
        setUser({ ...response.user, role: userRole });
        setRole(userRole);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      role,
      login,
      register,
      logout,
      loading,
    }),
    [isAuthenticated, user, role, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};


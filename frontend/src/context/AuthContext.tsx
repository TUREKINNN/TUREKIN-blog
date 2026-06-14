import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { type AuthUser, type LoginError, type UserRole, LOGIN_ERROR_MESSAGES } from '@/types/auth';
import { apiFetch, apiUpload } from '@/hooks/useApi';

const DEFAULT_AVATARS: Record<string, string> = {
  admin: '/avatar/root.png',
  visitor: '/avatar/user.png',
  guest: '/avatar/visitor.png',
};

const PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['article:read', 'article:create', 'article:edit', 'article:delete', 'article:like', 'article:pin', 'comment:create', 'comment:delete', 'comment:delete_own', 'comment:delete_any', 'comment:pin', 'comment:like', 'config:manage', 'upload:manage'],
  visitor: ['article:read', 'comment:create', 'comment:delete_own', 'article:like', 'comment:like'],
  guest: ['article:read', 'comment:create', 'article:like', 'comment:like'],
};

interface BackendUser {
  id: number;
  username: string;
  role: string;
  displayName: string;
  avatarUrl: string | null;
}

function toAuthUser(u: BackendUser): AuthUser {
  return {
    id: u.id,
    username: u.username,
    role: u.role as UserRole,
    displayName: u.displayName,
    avatar: u.avatarUrl || DEFAULT_AVATARS[u.role] || DEFAULT_AVATARS.guest,
  };
}

function cacheBustUrl(url: string): string {
  if (!url || url.startsWith('data:')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return url + sep + '_cb=' + Date.now();
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginError: LoginError | null;
  errorMessage: string;
  siteOwnerAvatar: string;
  siteOwnerAvatarCached: string;
  siteOwnerName: string;
  siteOwnerDisplayName: string;
  loginAsAdmin: (username: string, password: string) => Promise<boolean>;
  loginAsVisitor: (username: string, password: string) => Promise<boolean>;
  loginAsGuest: () => Promise<boolean>;
  registerVisitor: (username: string, password: string) => Promise<boolean>;
  updateProfile: (data: { username?: string; displayName?: string; password?: string; currentPassword?: string }) => Promise<boolean>;
  updateAvatar: (file: File) => Promise<boolean>;
  getUserAvatar: () => string;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  requireRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState<LoginError | null>(null);
  const [siteOwnerAvatar, setSiteOwnerAvatar] = useState<string>(DEFAULT_AVATARS.admin);
  const [siteOwnerName, setSiteOwnerName] = useState<string>('T');
  const [siteOwnerDisplayName, setSiteOwnerDisplayName] = useState<string>('TUREKIN');

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      apiFetch<BackendUser>('/api/auth/me'),
      apiFetch<BackendUser>('/api/auth/admin-profile'),
    ]).then(([currentUser, adminProfile]) => {
      if (cancelled) return;

      if (adminProfile) {
        const adminAuthUser = toAuthUser(adminProfile);
        setSiteOwnerAvatar(adminAuthUser.avatar);
        const initial = (adminAuthUser.displayName || adminAuthUser.username || 'T').charAt(0).toUpperCase();
        setSiteOwnerName(initial);
        setSiteOwnerDisplayName(adminAuthUser.displayName || adminAuthUser.username || 'TUREKIN');
      }

      if (currentUser) {
        const authUser = toAuthUser(currentUser);
        setUser(authUser);
        if (authUser.role === 'admin') {
          setSiteOwnerAvatar(authUser.avatar);
          const initial = (authUser.displayName || authUser.username || 'T').charAt(0).toUpperCase();
          setSiteOwnerName(initial);
          setSiteOwnerDisplayName(authUser.displayName || authUser.username || 'TUREKIN');
        }
      }

      setIsLoading(false);
    });

    return () => { cancelled = true; };
  }, []);

  const siteOwnerAvatarCached = useMemo(() => cacheBustUrl(siteOwnerAvatar), [siteOwnerAvatar]);

  async function handleLogin(username: string, password: string): Promise<AuthUser | null> {
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (!json.success) {
        const code = json.error?.code;
        if (code === 'UNAUTHORIZED') setLoginError('WRONG_PASSWORD');
        else if (code === 'NOT_FOUND') setLoginError('USER_NOT_FOUND');
        else if (code === 'RATE_LIMITED') setLoginError('RATE_LIMITED');
        else setLoginError('VALIDATION_ERROR');
        return null;
      }
      return toAuthUser(json.data);
    } catch (e) {
      console.error('Login failed:', e);
      setLoginError('VALIDATION_ERROR');
      return null;
    }
  }

  const loginAsAdmin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const authUser = await handleLogin(username, password);
    if (!authUser) return false;
    setUser(authUser);
    setSiteOwnerAvatar(authUser.avatar);
    const initial = (authUser.displayName || authUser.username || 'T').charAt(0).toUpperCase();
    setSiteOwnerName(initial);
    setSiteOwnerDisplayName(authUser.displayName || authUser.username || 'TUREKIN');
    return true;
  }, []);

  const loginAsVisitor = useCallback(async (username: string, password: string): Promise<boolean> => {
    const authUser = await handleLogin(username, password);
    if (!authUser) return false;
    setUser(authUser);
    return true;
  }, []);

  const loginAsGuest = useCallback(async (): Promise<boolean> => {
    setLoginError(null);
    const data = await apiFetch<BackendUser>('/api/auth/guest', { method: 'POST' });
    if (!data) {
      setLoginError('VALIDATION_ERROR');
      return false;
    }
    setUser(toAuthUser(data));
    return true;
  }, []);

  const registerVisitor = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoginError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, displayName: username }),
      });
      const json = await res.json();
      if (!json.success) {
        if (json.error?.code === 'CONFLICT') setLoginError('USERNAME_TAKEN');
        else setLoginError('VALIDATION_ERROR');
        return false;
      }
      setUser(toAuthUser(json.data));
      return true;
    } catch {
      setLoginError('VALIDATION_ERROR');
      return false;
    }
  }, []);

  const updateAvatar = useCallback(async (file: File): Promise<boolean> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const data = await apiUpload<{ avatarUrl: string }>('/api/auth/avatar', formData);
    if (!data || !user) return false;

    const updatedUser: AuthUser = { ...user, avatar: data.avatarUrl };
    setUser(updatedUser);
    if (user.role === 'admin') {
      setSiteOwnerAvatar(data.avatarUrl);
    }
    return true;
  }, [user]);

  const getUserAvatar = useCallback((): string => {
    if (!user) return DEFAULT_AVATARS.guest;
    return user.avatar;
  }, [user]);

  const updateProfileFn = useCallback(async (data: { username?: string; displayName?: string; password?: string; currentPassword?: string }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) return false;
      const updatedUser = toAuthUser(json.data);
      setUser(updatedUser);
      if (updatedUser.role === 'admin') {
        setSiteOwnerAvatar(updatedUser.avatar);
        const initial = (updatedUser.displayName || updatedUser.username || 'T').charAt(0).toUpperCase();
        setSiteOwnerName(initial);
        setSiteOwnerDisplayName(updatedUser.displayName || updatedUser.username || 'TUREKIN');
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await apiFetch<BackendUser>('/api/auth/me');
    if (data) {
      const authUser = toAuthUser(data);
      setUser(authUser);
      if (authUser.role === 'admin') {
        setSiteOwnerAvatar(authUser.avatar);
        const initial = (authUser.displayName || authUser.username || 'T').charAt(0).toUpperCase();
        setSiteOwnerName(initial);
        setSiteOwnerDisplayName(authUser.displayName || authUser.username || 'TUREKIN');
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setLoginError(null);
  }, []);

  const clearError = useCallback(() => {
    setLoginError(null);
  }, []);

  const requireRole = useCallback((role: UserRole): boolean => {
    return user !== null && user.role === role;
  }, [user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return PERMISSIONS[user.role].includes(permission);
  }, [user]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: user !== null,
    isLoading,
    loginError,
    errorMessage: loginError ? LOGIN_ERROR_MESSAGES[loginError] : '',
    siteOwnerAvatar,
    siteOwnerAvatarCached,
    siteOwnerName,
    siteOwnerDisplayName,
    loginAsAdmin,
    loginAsVisitor,
    loginAsGuest,
    registerVisitor,
    updateProfile: updateProfileFn,
    updateAvatar,
    getUserAvatar,
    refreshUser,
    logout,
    clearError,
    requireRole,
    hasPermission,
  }), [user, isLoading, loginError, siteOwnerAvatar, siteOwnerAvatarCached, siteOwnerName, siteOwnerDisplayName, loginAsAdmin, loginAsVisitor, loginAsGuest, registerVisitor, updateProfileFn, updateAvatar, getUserAvatar, refreshUser, logout, clearError, requireRole, hasPermission]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 内使用');
  return ctx;
}
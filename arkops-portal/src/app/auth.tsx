import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import type { Role } from './rolePermissions';

const AUTH_STORAGE_KEY = 'allmall-current-role';

interface AuthContextValue {
  /** Current user's role. Defaults to 'Owner' for demo. */
  role: Role;
  /** Switch role (for demo/testing purposes) */
  setRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [role, setRoleState] = useState<Role>(() => {
    const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return (stored as Role) ?? 'Owner';
  });

  const setRole = useCallback((next: Role) => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, next);
    setRoleState(next);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ role, setRole }), [role, setRole]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

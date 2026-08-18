import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import * as auth from './auth';
import type { Me } from './auth';

interface AuthContextValue {
  user: Me | null;
  login: typeof auth.login;
  signup: typeof auth.signup;
  logout: typeof auth.logout;
  fetchMe: typeof auth.fetchMe;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useSyncExternalStore(auth.subscribeUser, auth.getUserSnapshot);

  const value: AuthContextValue = {
    user,
    login: auth.login,
    signup: auth.signup,
    logout: auth.logout,
    fetchMe: auth.fetchMe,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}

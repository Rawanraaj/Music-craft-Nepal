import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; isAdmin: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// TODO: replace with real auth before production
const ADMIN_EMAIL = 'admin@musiccraftnepal.com';
const ADMIN_PASSWORD = 'MCN@Admin2026';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mcn-user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('mcn-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mcn-user');
    }
  }, [user]);

  const login = (email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        email: ADMIN_EMAIL,
        name: 'Admin',
        isAdmin: true,
      };
      setUser(adminUser);
      return { success: true, isAdmin: true };
    }

    // Regular user check from localStorage registry
    try {
      const registry = JSON.parse(localStorage.getItem('mcn-registry') || '[]');
      const found = registry.find(
        (u: { email: string; password: string; name: string }) =>
          u.email.toLowerCase() === normalizedEmail && u.password === password
      );
      if (found) {
        setUser({ email: found.email, name: found.name, isAdmin: false });
        return { success: true, isAdmin: false };
      }
    } catch {
      // registry not available
    }

    return { success: false, isAdmin: false, error: 'Invalid email or password.' };
  };

  const register = (name: string, email: string, password: string) => {
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === ADMIN_EMAIL) {
      return { success: false, error: 'This email is reserved.' };
    }

    try {
      const registry = JSON.parse(localStorage.getItem('mcn-registry') || '[]');
      if (registry.some((u: { email: string }) => u.email.toLowerCase() === normalizedEmail)) {
        return { success: false, error: 'An account with this email already exists.' };
      }
      registry.push({ name, email: normalizedEmail, password });
      localStorage.setItem('mcn-registry', JSON.stringify(registry));
      setUser({ email: normalizedEmail, name, isAdmin: false });
      return { success: true };
    } catch {
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

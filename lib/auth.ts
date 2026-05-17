import { UserStore, StudentStore, RecruiterStore } from './store';
import {
  hashPassword, verifyPassword, createSessionToken,
  parseSessionToken, generateId, sanitizeString, isValidEmail
} from './security';
import type { User, UserRole } from '@/types';

const SESSION_KEY = 'if_session';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

function setSessionCookie(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `if_session=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Strict`;
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'if_session=; path=/; max-age=0; SameSite=Strict';
}

export interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
  role?: UserRole;
}

export async function signUp(
  email: string,
  password: string,
  role: 'student' | 'recruiter'
): Promise<AuthResult> {
  const cleanEmail = sanitizeString(email).toLowerCase();
  if (!isValidEmail(cleanEmail)) return { success: false, error: 'Invalid email address.' };
  if (password.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };
  if (UserStore.getByEmail(cleanEmail)) return { success: false, error: 'An account with this email already exists.' };

  const id = generateId();
  const passwordHash = await hashPassword(password);
  const user: User = {
    id, email: cleanEmail, passwordHash, role,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    isVerified: false, isBanned: false, lastLogin: new Date().toISOString(),
  };
  UserStore.save(user);

  const token = createSessionToken(id);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, token);
    setSessionCookie(token);
  }

  return { success: true, userId: id, role };
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  const cleanEmail = sanitizeString(email).toLowerCase();
  const user = UserStore.getByEmail(cleanEmail);
  if (!user) return { success: false, error: 'No account found with this email.' };
  if (user.isBanned) return { success: false, error: 'This account has been suspended.' };

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return { success: false, error: 'Incorrect password.' };

  const token = createSessionToken(user.id);
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_KEY, token);
    setSessionCookie(token);
  }

  user.lastLogin = new Date().toISOString();
  user.updatedAt = new Date().toISOString();
  UserStore.save(user);

  return { success: true, userId: user.id, role: user.role };
}

export function signOut(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_KEY);
    clearSessionCookie();
  }
}

export function getCurrentSession(): { userId: string; role: UserRole } | null {
  if (typeof window === 'undefined') return null;
  const token = sessionStorage.getItem(SESSION_KEY);
  if (!token) return null;
  const parsed = parseSessionToken(token);
  if (!parsed) return null;
  const user = UserStore.getById(parsed.userId);
  if (!user || user.isBanned) return null;
  return { userId: user.id, role: user.role };
}

export function getProfile(userId: string, role: UserRole) {
  if (role === 'student') return StudentStore.getById(userId);
  if (role === 'recruiter') return RecruiterStore.getById(userId);
  return null;
}

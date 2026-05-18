'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { signInAction, signUpAction, signOutAction, getSessionAction, getProfileAction } from '@/app/actions/auth';
import type { UserRole, StudentProfile, RecruiterProfile } from '@/types';

interface AuthContextValue {
  userId: string | null;
  role: UserRole | null;
  studentProfile: StudentProfile | null;
  recruiterProfile: RecruiterProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  register: (email: string, password: string, role: 'student' | 'recruiter') => Promise<{ success: boolean; error?: string; userId?: string }>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [recruiterProfile, setRecruiterProfile] = useState<RecruiterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async (uid: string, r: UserRole) => {
    try {
      const profile = await getProfileAction(uid, r);
      if (r === 'student') {
        setStudentProfile(profile as StudentProfile | null);
        setRecruiterProfile(null);
      } else if (r === 'recruiter') {
        setRecruiterProfile(profile as RecruiterProfile | null);
        setStudentProfile(null);
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const session = await getSessionAction();
      if (session) {
        setUserId(session.userId);
        setRole(session.role);
        await loadProfile(session.userId, session.role);
      }
      setIsLoading(false);
    }
    init();
  }, [loadProfile]);

  const login = async (email: string, password: string) => {
    const result = await signInAction(email, password);
    if (result.success && result.userId && result.role) {
      setUserId(result.userId);
      setRole(result.role);
      await loadProfile(result.userId, result.role);
    }
    return { success: result.success, error: result.error };
  };

  const logout = async () => {
    await signOutAction();
    setUserId(null);
    setRole(null);
    setStudentProfile(null);
    setRecruiterProfile(null);
  };

  const register = async (email: string, password: string, r: 'student' | 'recruiter') => {
    const result = await signUpAction(email, password, r);
    if (result.success && result.userId) {
      setUserId(result.userId);
      setRole(r);
      await loadProfile(result.userId, r);
    }
    return { success: result.success, error: result.error, userId: result.userId };
  };

  const refreshProfile = () => {
    if (userId && role) loadProfile(userId, role);
  };

  return (
    <AuthContext.Provider value={{
      userId, role, studentProfile, recruiterProfile,
      isLoading, isAuthenticated: !!userId,
      login, logout, register, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

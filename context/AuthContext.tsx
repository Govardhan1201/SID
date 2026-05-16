'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { getCurrentSession, signIn, signOut, signUp } from '@/lib/auth';
import { StudentStore, RecruiterStore, UserStore } from '@/lib/store';
import { seedDatabase, } from '@/lib/seed';
import { isSeeded } from '@/lib/store';
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

  const loadProfile = useCallback((uid: string, r: UserRole) => {
    if (r === 'student') {
      setStudentProfile(StudentStore.getById(uid) ?? null);
      setRecruiterProfile(null);
    } else if (r === 'recruiter') {
      setRecruiterProfile(RecruiterStore.getById(uid) ?? null);
      setStudentProfile(null);
    }
  }, []);

  useEffect(() => {
    async function init() {
      if (!isSeeded()) {
        await seedDatabase();
      }
      const session = getCurrentSession();
      if (session) {
        setUserId(session.userId);
        setRole(session.role);
        loadProfile(session.userId, session.role);
      }
      setIsLoading(false);
    }
    init();
  }, [loadProfile]);

  const login = async (email: string, password: string) => {
    const result = await signIn(email, password);
    if (result.success && result.userId && result.role) {
      setUserId(result.userId);
      setRole(result.role);
      loadProfile(result.userId, result.role);
    }
    return { success: result.success, error: result.error };
  };

  const logout = () => {
    signOut();
    setUserId(null);
    setRole(null);
    setStudentProfile(null);
    setRecruiterProfile(null);
  };

  const register = async (email: string, password: string, r: 'student' | 'recruiter') => {
    const result = await signUp(email, password, r);
    if (result.success && result.userId) {
      setUserId(result.userId);
      setRole(r);
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

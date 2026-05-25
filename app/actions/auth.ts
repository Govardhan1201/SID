'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSessionToken, verifySessionToken } from '@/lib/jwt';
import type { UserRole } from '@/types';

const SESSION_COOKIE = 'if_session';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export async function signInAction(email: string, password: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    
    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) return { success: false, error: 'No account found with this email.' };
    if (user.isBanned) return { success: false, error: 'This account has been suspended.' };

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { success: false, error: 'Incorrect password.' };

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Create secure JWT session
    const token = await signSessionToken({ userId: user.id, role: user.role as UserRole });
    
    // Set HTTP-only cookie
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });

    return { success: true, userId: user.id, role: user.role as UserRole };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

export async function signUpAction(email: string, password: string, role: 'student' | 'recruiter') {
  try {
    const cleanEmail = email.trim().toLowerCase();

    // Check if exists
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) return { success: false, error: 'An account with this email already exists.' };

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction
    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          role,
          isVerified: true,
        }
      });

      if (role === 'student') {
        await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            name: cleanEmail.split('@')[0], // placeholder name
          }
        });
      } else if (role === 'recruiter') {
        await tx.recruiterProfile.create({
          data: {
            userId: newUser.id,
            name: cleanEmail.split('@')[0],
            company: 'New Company',
          }
        });
      }

      return newUser;
    });

    // Create session
    const token = await signSessionToken({ userId: user.id, role: user.role as UserRole });
    (await cookies()).set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: MAX_AGE,
      path: '/',
    });

    return { success: true, userId: user.id, role: user.role as UserRole };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: 'An unexpected error occurred during registration.' };
  }
}

export async function signOutAction() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getSessionAction() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  // Optionally verify user still exists in DB
  const user = await prisma.user.findUnique({ 
    where: { id: payload.userId },
    select: { isBanned: true }
  });

  if (!user || user.isBanned) return null;

  return { userId: payload.userId, role: payload.role };
}

export async function getProfileAction(userId: string, role: UserRole) {
  if (role === 'student') {
    return await prisma.studentProfile.findUnique({ where: { userId } });
  } else if (role === 'recruiter') {
    return await prisma.recruiterProfile.findUnique({ where: { userId } });
  }
  return null;
}

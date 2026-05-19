'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/jwt';

const SESSION_COOKIE = 'if_session';
const MAX_ADMINS = 5;

export async function getAllUsersAdmin() {
  return await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function toggleUserBanStatus(userId: string, isBanned: boolean) {
  return await prisma.user.update({ where: { id: userId }, data: { isBanned } });
}

export async function getAllAuditLogs() {
  return await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
}

export async function createAuditLog(data: any) {
  return await prisma.auditLog.create({ data });
}

export async function getAdminCount() {
  return await prisma.user.count({ where: { role: 'admin' } });
}

/** Sends an OTP to the given admin email using the in-app email API */
export async function sendAdminOtp(email: string): Promise<{ success: boolean; error?: string }> {
  // Verify the requesting user is an admin
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { success: false, error: 'Not authenticated' };
  const payload = await verifySessionToken(token);
  if (!payload || payload.role !== 'admin') return { success: false, error: 'Forbidden' };

  // Check admin cap
  const adminCount = await getAdminCount();
  if (adminCount >= MAX_ADMINS) return { success: false, error: `Maximum of ${MAX_ADMINS} admin accounts allowed.` };

  // Generate a 6-digit OTP and store in DB (reuse Notification model as temp store)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  // Store OTP as a notification for a sentinel userId "admin-otp"
  await prisma.notification.deleteMany({ where: { userId: 'admin-otp', type: 'message' } });
  await prisma.notification.create({
    data: {
      userId: 'admin-otp',
      title: `OTP for ${email}`,
      message: otp,
      type: 'message',
      link: email,
      isRead: false,
    }
  });

  // Send email via the API route (server-to-server fetch)
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'IdeaForge — Admin Account OTP',
        html: `<div style="font-family:sans-serif;max-width:480px;margin:auto">
          <h2>Admin Account Creation</h2>
          <p>Your one-time password (valid for 10 minutes):</p>
          <div style="font-size:2rem;font-weight:800;letter-spacing:0.2em;color:#6c63ff;padding:20px;background:#0f0f14;border-radius:12px;text-align:center">${otp}</div>
          <p style="color:#888;font-size:12px;margin-top:16px">If you did not request this, please ignore it.</p>
        </div>`,
      }),
    });
  } catch (e) {
    return { success: false, error: 'Failed to send email. Check EMAIL_APP_PASSWORD.' };
  }

  return { success: true };
}

/** Creates a new admin user after verifying the OTP */
export async function createAdminUser(
  email: string, password: string, otp: string
): Promise<{ success: boolean; error?: string }> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return { success: false, error: 'Not authenticated' };
  const payload = await verifySessionToken(token);
  if (!payload || payload.role !== 'admin') return { success: false, error: 'Forbidden' };

  // Check admin cap
  const adminCount = await getAdminCount();
  if (adminCount >= MAX_ADMINS) return { success: false, error: `Maximum of ${MAX_ADMINS} admin accounts allowed.` };

  // Verify OTP
  const stored = await prisma.notification.findFirst({
    where: { userId: 'admin-otp', type: 'message', link: email.trim().toLowerCase() }
  });
  if (!stored) return { success: false, error: 'No OTP found for this email. Request a new one.' };
  if (stored.message !== otp.trim()) return { success: false, error: 'Invalid OTP.' };

  // Check OTP age (10 min)
  const age = Date.now() - new Date(stored.createdAt).getTime();
  if (age > 10 * 60 * 1000) return { success: false, error: 'OTP has expired. Request a new one.' };

  // Clean up OTP
  await prisma.notification.delete({ where: { id: stored.id } });

  // Check email not already taken
  const cleanEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
  if (existing) return { success: false, error: 'An account with this email already exists.' };

  // Create admin user
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { email: cleanEmail, passwordHash, role: 'admin' } });

  return { success: true };
}

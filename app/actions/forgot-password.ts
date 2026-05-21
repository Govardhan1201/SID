'use server';
import { prisma as db } from '@/lib/prisma';
import { hashPassword } from '@/lib/security';

// In-memory OTP store (for demo; in prod use Redis/DB)
const otpStore = new Map<string, { otp: string; expires: number; email: string }>();

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      // Don't reveal if email exists
      return { success: true };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const key = email.toLowerCase().trim();
    otpStore.set(key, { otp, expires: Date.now() + 10 * 60 * 1000, email: key });

    // Send email via the existing /api/send-email route (server-side fetch)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: email,
        subject: 'IdeaForge - Password Reset OTP',
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#00f2fe">Password Reset</h2>
          <p>Your one-time password (OTP) to reset your IdeaForge password is:</p>
          <div style="font-size:2rem;font-weight:900;letter-spacing:0.4em;text-align:center;padding:16px;background:#111;border-radius:8px;color:#fff;margin:16px 0">${otp}</div>
          <p style="color:#888">This OTP expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
        </div>`,
        text: `Your IdeaForge password reset OTP is: ${otp}. It expires in 10 minutes.`,
      }),
    });

    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function verifyOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const key = email.toLowerCase().trim();
  const record = otpStore.get(key);
  if (!record) return { success: false, error: 'No OTP found. Please request a new one.' };
  if (Date.now() > record.expires) {
    otpStore.delete(key);
    return { success: false, error: 'OTP expired. Please request a new one.' };
  }
  if (record.otp !== otp.trim()) return { success: false, error: 'Incorrect OTP. Please try again.' };
  return { success: true };
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  const verify = await verifyOTP(email, otp);
  if (!verify.success) return verify;
  if (newPassword.length < 8) return { success: false, error: 'Password must be at least 8 characters.' };
  try {
    const key = email.toLowerCase().trim();
    const passwordHash = await hashPassword(newPassword);
    await db.user.update({ where: { email: key }, data: { passwordHash } });
    otpStore.delete(key);
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: 'Failed to update password.' };
  }
}

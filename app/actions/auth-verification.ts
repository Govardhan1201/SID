'use server';
import { prisma } from '@/lib/prisma';

export async function requestSignupOtp(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const key = email.toLowerCase().trim();
    
    // Check if email already registered and verified
    const existingUser = await prisma.user.findUnique({ where: { email: key } });
    if (existingUser && existingUser.isVerified) {
      return { success: false, error: 'Email already registered.' };
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB, update if exists
    await prisma.otp.upsert({
      where: { email: key },
      update: { code, expiresAt },
      create: { email: key, code, expiresAt }
    });

    // Send email via the existing /api/send-email route
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: key,
        subject: 'IdeaForge - Verify your email',
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
          <h2 style="color:#00f2fe">Welcome to IdeaForge</h2>
          <p>Your one-time password (OTP) to verify your email is:</p>
          <div style="font-size:2rem;font-weight:900;letter-spacing:0.4em;text-align:center;padding:16px;background:#111;border-radius:8px;color:#fff;margin:16px 0">${code}</div>
          <p style="color:#888">This OTP expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
        </div>`,
        text: `Your IdeaForge email verification OTP is: ${code}. It expires in 10 minutes.`,
      }),
    });

    return { success: true };
  } catch (error) {
    console.error('OTP Error:', error);
    return { success: false, error: 'Failed to request OTP.' };
  }
}

export async function verifySignupOtp(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const key = email.toLowerCase().trim();
    const record = await prisma.otp.findUnique({ where: { email: key } });

    if (!record) return { success: false, error: 'No OTP found. Please request a new one.' };
    if (Date.now() > record.expiresAt.getTime()) {
      await prisma.otp.delete({ where: { email: key } });
      return { success: false, error: 'OTP expired. Please request a new one.' };
    }
    if (record.code !== code.trim()) {
      return { success: false, error: 'Incorrect OTP. Please try again.' };
    }

    // OTP verified successfully. Remove it from prisma.
    await prisma.otp.delete({ where: { email: key } });
    return { success: true };
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return { success: false, error: 'Failed to verify OTP.' };
  }
}


import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@/types';

// In production, this should be a secure random 32-byte string in .env
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-development-key-change-in-production'
);

export interface SessionPayload {
  userId: string;
  role: UserRole;
  [key: string]: any;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch (error) {
    return null;
  }
}

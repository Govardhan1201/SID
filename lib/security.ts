// Security utilities — XSS prevention, input sanitization, rate limiting

// ── Sanitization ─────────────────────────────────────────────────────────────

/**
 * Strip HTML tags and dangerous characters from user input.
 * Use this on every string before storing or rendering.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;')
    .trim()
    .slice(0, 10000); // hard cap
}

/** Sanitize an object's string fields recursively. */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (typeof val === 'string') {
      result[key] = sanitizeString(val);
    } else if (Array.isArray(val)) {
      result[key] = val.map(v => (typeof v === 'string' ? sanitizeString(v) : v));
    } else if (val && typeof val === 'object') {
      result[key] = sanitizeObject(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result as T;
}

// ── Email / URL validation ────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  const re = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  return re.test(email) && email.length <= 254;
}

export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol);
  } catch {
    return false;
  }
}

// ── Password strength ─────────────────────────────────────────────────────────

export interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 4);

  const labels = ['Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  return { score, label: labels[score], color: colors[score] };
}

export function isStrongPassword(password: string): boolean {
  return checkPasswordStrength(password).score >= 2;
}

// ── Rate limiting (client-side) ───────────────────────────────────────────────

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * Simple sliding window rate limiter.
 * Returns true if the action is allowed.
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }

  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

// ── CSRF token ────────────────────────────────────────────────────────────────

export function generateCSRFToken(): string {
  const arr = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(arr);
  }
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

export function getOrCreateCSRFToken(): string {
  if (typeof window === 'undefined') return '';
  let token = sessionStorage.getItem('_csrf');
  if (!token) {
    token = generateCSRFToken();
    sessionStorage.setItem('_csrf', token);
  }
  return token;
}

// ── UUID generation ───────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ── Simple password hashing (client-side simulation) ─────────────────────────
// In production this would be server-side bcrypt. Here we use a
// deterministic hash simulation for demo without exposing plaintext.

export async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined') return password;
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_ideaforge_salt_2024');
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// ── Session token ─────────────────────────────────────────────────────────────

export function createSessionToken(userId: string): string {
  const payload = { userId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
}

export function parseSessionToken(token: string): { userId: string; exp: number } | null {
  try {
    const payload = JSON.parse(atob(token));
    if (typeof payload.userId !== 'string' || typeof payload.exp !== 'number') return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

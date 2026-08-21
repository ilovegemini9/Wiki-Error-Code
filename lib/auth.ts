import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'ecw_admin_token';
const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'error-code-wiki-default-dev-secret-key-2026';

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
}

export function generateSessionToken(username: string): string {
  const timestamp = Date.now();
  const raw = `${username}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY).update(raw).digest('hex');
  return Buffer.from(`${raw}:${hmac}`).toString('base64');
}

export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false };

    const [username, timestampStr, hmac] = parts;
    const raw = `${username}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', SECRET_KEY).update(raw).digest('hex');

    if (hmac !== expectedHmac) return { valid: false };

    // Session valid for 7 days
    const age = Date.now() - parseInt(timestampStr, 10);
    if (age > 7 * 24 * 60 * 60 * 1000) return { valid: false };

    return { valid: true, username };
  } catch {
    return { valid: false };
  }
}

export async function verifyAdminCredentials(user: string, pass: string): Promise<boolean> {
  const envUser = process.env.ADMIN_USERNAME || 'admin';
  const envPass = process.env.ADMIN_PASSWORD || '111111';

  return user === envUser && pass === envPass;
}

export async function setAdminSessionCookie(username: string) {
  const token = generateSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const result = verifySessionToken(token);
  return result.valid;
}

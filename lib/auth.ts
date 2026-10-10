import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'ecw_admin_token';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function getSessionSecret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!configured) throw new Error('ADMIN_SESSION_SECRET must be configured.');
  if (configured.length < 32) throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters.');
  return configured;
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function hashPassword(password: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(password).digest('hex');
}

export function generateSessionToken(username: string): string {
  const timestamp = Date.now();
  const raw = `${username}:${timestamp}`;
  const hmac = crypto.createHmac('sha256', getSessionSecret()).update(raw).digest('hex');
  return Buffer.from(`${raw}:${hmac}`).toString('base64');
}

export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    if (parts.length !== 3) return { valid: false };
    const [username, timestampStr, hmac] = parts;
    if (!username || !/^\d+$/.test(timestampStr) || !/^[a-f0-9]{64}$/.test(hmac)) {
      return { valid: false };
    }

    const raw = `${username}:${timestampStr}`;
    const expectedHmac = crypto.createHmac('sha256', getSessionSecret()).update(raw).digest('hex');
    if (!safeEqual(hmac, expectedHmac)) return { valid: false };

    const timestamp = Number(timestampStr);
    if (!Number.isSafeInteger(timestamp)) return { valid: false };
    const age = Date.now() - timestamp;
    if (age > SESSION_TTL_MS || age < -5 * 60 * 1000) return { valid: false };
    return { valid: true, username };
  } catch {
    return { valid: false };
  }
}

export async function verifyAdminCredentials(user: string, pass: string): Promise<boolean> {
  const envUser = process.env.ADMIN_USERNAME?.trim();
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envUser || !envPass) throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be configured.');
  return safeEqual(user, envUser) && safeEqual(pass, envPass);
}

export async function setAdminSessionCookie(username: string) {
  const token = generateSessionToken(username);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticatedAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const configuredUsername = process.env.ADMIN_USERNAME?.trim();
    if (!token || !configuredUsername) return false;

    const session = verifySessionToken(token);
    return session.valid && safeEqual(session.username ?? '', configuredUsername);
  } catch {
    return false;
  }
}

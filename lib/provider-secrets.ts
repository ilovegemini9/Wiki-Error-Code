import 'server-only';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { supabaseAdmin } from '@/lib/supabase';

const COLUMN = 'openrouter_api_key_encrypted';

function encryptionKey() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET must be configured to securely store provider keys.');
  return createHash('sha256').update(secret).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv.toString('base64'), cipher.getAuthTag().toString('base64'), encrypted.toString('base64')].join('.');
}

function decrypt(value: string) {
  const [ivText, tagText, encryptedText] = value.split('.');
  if (!ivText || !tagText || !encryptedText) throw new Error('Stored provider key has an invalid format.');
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64'));
  decipher.setAuthTag(Buffer.from(tagText, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]).toString('utf8');
}

export async function getOpenRouterApiKey(): Promise<string | undefined> {
  // A key explicitly saved and validated in Admin Settings is authoritative.
  // Use the Vercel environment variable only when no database key is stored,
  // so an old environment secret cannot silently override the newly saved key.
  if (supabaseAdmin) {
    const { data, error } = await (supabaseAdmin as any)
      .from('global_settings')
      .select(COLUMN)
      .eq('id', 'global')
      .maybeSingle();
    if (error) throw error;
    const encrypted = data?.[COLUMN];
    if (typeof encrypted === 'string' && encrypted) return decrypt(encrypted).trim();
  }
  return process.env.OPENROUTER_API_KEY?.trim() || undefined;
}

export async function saveOpenRouterApiKey(apiKey: string): Promise<void> {
  if (!supabaseAdmin) throw new Error('Supabase is not configured; cannot save the provider key securely.');
  const { error } = await (supabaseAdmin as any).from('global_settings').upsert({
    id: 'global',
    [COLUMN]: encrypt(apiKey.trim()),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw error;
}

export async function hasOpenRouterApiKey(): Promise<boolean> {
  if (process.env.OPENROUTER_API_KEY?.trim()) return true;
  if (!supabaseAdmin) return false;
  const { data, error } = await (supabaseAdmin as any)
    .from('global_settings')
    .select(COLUMN)
    .eq('id', 'global')
    .maybeSingle();
  if (error) throw error;
  return typeof data?.[COLUMN] === 'string' && data[COLUMN].length > 0;
}

import { createClient } from '@supabase/supabase-js';

// Server-only Supabase admin client helper.
// Usage: import { supabaseAdmin } from '@/lib/supabase';
// IMPORTANT: Only use this from server-side code. Do NOT expose the
// SUPABASE_SERVICE_ROLE_KEY to client code or bundle it into the frontend.

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseServiceRoleKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
    global: { headers: { 'x-client-info': 'wiki-error-code-server' } }
  });
} else {
  // Do not throw — allow local dev without Supabase configured.
  // Log a clear warning so server operators know to provide envs before running migration/app.
  // Never log secret values.
  // eslint-disable-next-line no-console
  console.warn('Supabase admin client not fully configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable Supabase integration.');
}

export { supabaseAdmin };

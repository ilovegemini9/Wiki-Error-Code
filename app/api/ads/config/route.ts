import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const DEFAULT_CONFIG = {
  enabled: false,
  client: '',
  slots: {
    top: '',
    'in-content': '',
    sidebar: '',
    'sticky-mobile': '',
    bottom: '',
  },
};

type GlobalSettingsRow = {
  raw_settings: Record<string, unknown> | null;
};

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json(DEFAULT_CONFIG, { headers: { 'Cache-Control': 'no-store' } });
    const result = await (supabaseAdmin.from('global_settings').select('raw_settings').eq('id', 'global').maybeSingle() as unknown as Promise<{ data: GlobalSettingsRow | null; error: Error | null }>);
    const { data, error } = result;
    if (error) throw error;
    const rawSettings = data?.raw_settings;
    const ads = rawSettings && typeof rawSettings === 'object' && 'ads' in rawSettings && rawSettings.ads && typeof rawSettings.ads === 'object'
      ? rawSettings.ads as Record<string, unknown>
      : {};
    const slots = ads.slots && typeof ads.slots === 'object' ? ads.slots as Record<string, unknown> : {};
    return NextResponse.json({
      enabled: ads.enabled === true,
      client: typeof ads.client === 'string' ? ads.client : '',
      slots: {
        ...DEFAULT_CONFIG.slots,
        ...Object.fromEntries(Object.entries(slots).filter(([key, value]) => key in DEFAULT_CONFIG.slots && typeof value === 'string')),
      },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}

// Keep this route build-safe with Supabase generated types that may lag the schema.

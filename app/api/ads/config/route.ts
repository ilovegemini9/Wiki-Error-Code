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

export async function GET() {
  try {
    if (!supabaseAdmin) return NextResponse.json(DEFAULT_CONFIG, { headers: { 'Cache-Control': 'no-store' } });
    const { data, error } = await supabaseAdmin.from('global_settings').select('raw_settings').eq('id', 'global').maybeSingle();
    if (error) throw error;
    const ads = (data?.raw_settings as any)?.ads || {};
    return NextResponse.json({
      enabled: ads.enabled === true,
      client: typeof ads.client === 'string' ? ads.client : '',
      slots: { ...DEFAULT_CONFIG.slots, ...(ads.slots || {}) },
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }
}

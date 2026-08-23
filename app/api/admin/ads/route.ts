import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const EMPTY = { enabled: false, client: '', slots: { top: '', 'in-content': '', sidebar: '', 'sticky-mobile': '', bottom: '' } };
type SettingsRow = { raw_settings: Record<string, unknown> | null };
type AdsSettings = { enabled?: boolean; client?: string; slots?: Record<string, string> };

export async function GET() {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ ads: EMPTY });
  const { data, error } = await supabaseAdmin.from('global_settings').select('raw_settings').eq('id', 'global').maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const row = data as unknown as SettingsRow | null;
  const ads = (row?.raw_settings?.ads as AdsSettings | undefined) || {};
  return NextResponse.json({ ads: { ...EMPTY, ...ads, slots: { ...EMPTY.slots, ...(ads.slots || {}) } } });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!supabaseAdmin) return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  try {
    const body = await req.json();
    const ads: AdsSettings = {
      enabled: body?.enabled === true,
      client: typeof body?.client === 'string' ? body.client.trim() : '',
      slots: {
        top: typeof body?.slots?.top === 'string' ? body.slots.top.trim() : '',
        'in-content': typeof body?.slots?.['in-content'] === 'string' ? body.slots['in-content'].trim() : '',
        sidebar: typeof body?.slots?.sidebar === 'string' ? body.slots.sidebar.trim() : '',
        'sticky-mobile': typeof body?.slots?.['sticky-mobile'] === 'string' ? body.slots['sticky-mobile'].trim() : '',
        bottom: typeof body?.slots?.bottom === 'string' ? body.slots.bottom.trim() : '',
      },
    };
    const { data: current, error: readError } = await supabaseAdmin.from('global_settings').select('raw_settings').eq('id', 'global').single();
    if (readError) throw readError;
    const row = current as unknown as SettingsRow | null;
    const raw = row?.raw_settings && typeof row.raw_settings === 'object' ? row.raw_settings : {};

    // The generated Supabase Database type currently exposes global_settings.raw_settings
    // too narrowly (update() resolves to never). Keep the runtime payload typed locally
    // until the generated database types are refreshed from the current schema.
    const settingsTable = supabaseAdmin.from('global_settings') as any;
    const { data, error } = await settingsTable
      .update({ raw_settings: { ...raw, ads } })
      .eq('id', 'global')
      .select('raw_settings')
      .single();
    if (error) throw error;
    const savedRow = data as SettingsRow;
    return NextResponse.json({ success: true, ads: (savedRow.raw_settings?.ads as AdsSettings | undefined) || ads });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to save ads' }, { status: 500 });
  }
}

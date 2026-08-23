import { NextResponse } from 'next/server';
import { getSupabaseSettings } from '@/lib/supabase-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSupabaseSettings();
  const content = settings.adsTxtContent || '# ErrorCodeWiki ads.txt\n# Configure your real publisher entry in Admin Settings.';
  return new NextResponse(content, { headers: { 'Content-Type': 'text/plain', 'Cache-Control': 's-maxage=86400, stale-while-revalidate' } });
}

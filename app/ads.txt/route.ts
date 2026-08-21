import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = db.getSettings();
  const content = settings.adsTxtContent || '# ErrorCodeWiki ads.txt\n# google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0';

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}

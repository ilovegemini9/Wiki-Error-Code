import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent } from '@/lib/analytics';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') return NextResponse.json({ ok: false }, { status: 400 });
    await recordAnalyticsEvent({
      ...body,
      countryCode: request.headers.get('x-vercel-ip-country') || body.countryCode,
      region: request.headers.get('x-vercel-ip-country-region') || body.region,
    });
    return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}

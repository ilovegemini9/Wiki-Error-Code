import { NextRequest, NextResponse } from 'next/server';
import { checkAndRunAutomationServer } from '@/lib/automation-runner';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Vercel Cron entry point. Configure CRON_SECRET in the deployment environment.
 * The background interval is not a reliable scheduler in serverless functions.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET?.trim();

  // Fail closed: never expose the automation trigger when the secret is absent.
  if (!cronSecret) {
    return NextResponse.json({ error: 'Cron endpoint is not configured.' }, { status: 503 });
  }

  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const ran = await checkAndRunAutomationServer();
    return NextResponse.json({
      ok: true,
      ran,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Keep provider/database details out of the unauthenticated HTTP response.
    return NextResponse.json({ error: 'Automation check failed.' }, { status: 500 });
  }
}

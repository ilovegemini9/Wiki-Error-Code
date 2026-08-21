import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { checkAndRunAutomationServer } from '@/lib/automation-runner';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Trigger background check if automation is active
  checkAndRunAutomationServer().catch(() => {});
  const settings = db.getSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = db.saveSettings(body);
    checkAndRunAutomationServer().catch(() => {});
    return NextResponse.json({ success: true, settings });
  } catch {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { checkAndRunAutomationServer } from '@/lib/automation-runner';
import { getSupabaseSettings, saveSupabaseSettings } from '@/lib/supabase-db';
import { getOpenRouterApiKeySource, hasOpenRouterApiKey } from '@/lib/provider-secrets';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    checkAndRunAutomationServer().catch(() => {});
    const settings = await getSupabaseSettings();
    // Never return the secret itself; expose only a boolean status to the authenticated admin.
    return NextResponse.json({
      settings,
      providerStatus: {
        hasOpenRouterApiKey: await hasOpenRouterApiKey(),
        // Never expose secret material. This helps admins confirm which configured source is active.
        openRouterKeySource: await getOpenRouterApiKeySource(),
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const settings = await saveSupabaseSettings(body);
    checkAndRunAutomationServer().catch(() => {});
    return NextResponse.json({ success: true, settings });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to save settings' }, { status: 500 });
  }
}

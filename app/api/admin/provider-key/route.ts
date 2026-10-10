import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { saveOpenRouterApiKey } from '@/lib/provider-secrets';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    if (!apiKey || apiKey.length < 10 || apiKey.length > 500) {
      return NextResponse.json({ success: false, error: 'Enter a valid OpenRouter API key.' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    let response: Response;
    try {
      response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: 'no-store',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: response.status === 401 || response.status === 403
          ? 'OpenRouter rejected this key. Check that you copied the API key correctly.'
          : response.status === 429
            ? 'OpenRouter rate-limited key validation. Wait a moment and try again.'
            : `OpenRouter key validation failed (HTTP ${response.status}). Try again shortly.`,
      }, { status: 400 });
    }

    await saveOpenRouterApiKey(apiKey);
    return NextResponse.json({ success: true, message: 'Key validated and saved securely. The secret is encrypted on the server and is never sent back to the browser.' });
  } catch (error) {
    const message = error instanceof Error && error.name === 'AbortError'
      ? 'OpenRouter key validation timed out. Try again.'
      : error instanceof Error ? error.message : 'Could not save the OpenRouter key.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

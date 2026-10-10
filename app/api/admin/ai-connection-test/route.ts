import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getOpenRouterApiKey } from '@/lib/provider-secrets';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let apiKey: string | undefined;
  try {
    apiKey = (await getOpenRouterApiKey())?.trim();
  } catch {
    return NextResponse.json({ success: false, status: 'secret_store_error', error: 'Could not read the securely stored API key. Check server configuration.' }, { status: 500 });
  }
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      status: 'missing_key',
      error: 'No OpenRouter API key is configured. Save one in Admin Settings first.',
    }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
      method: 'GET',
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      const status = response.status === 401 || response.status === 403
        ? 'invalid_key'
        : response.status === 429 ? 'rate_limited' : 'provider_error';
      const error = status === 'invalid_key'
        ? 'OpenRouter rejected the saved key. Replace it with a valid API key.'
        : status === 'rate_limited'
          ? 'OpenRouter rate-limited key validation. Wait a moment and try again.'
          : `OpenRouter key validation failed (HTTP ${response.status}).`;
      return NextResponse.json({ success: false, status, error }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'OpenRouter accepted the saved API key.',
      model: 'Key validation (provider authentication)',
      keyInfo: data.data ? { label: data.data.label || undefined, limit: data.data.limit ?? undefined, limitRemaining: data.data.limit_remaining ?? undefined } : undefined,
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json({
      success: false,
      status: aborted ? 'timeout' : 'connection_error',
      error: aborted ? 'OpenRouter key validation timed out after 12 seconds.' : 'Could not reach OpenRouter. Check the deployment network and try again.',
    }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

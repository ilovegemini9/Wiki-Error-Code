import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getOpenRouterApiKey } from '@/lib/provider-secrets';

export const dynamic = 'force-dynamic';

export async function POST() {
  if (!(await isAuthenticatedAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = (await getOpenRouterApiKey())?.trim();
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      status: 'missing_key',
      error: 'No OpenRouter API key is configured. Save one in Admin Settings first.',
    }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://errorcodewiki.vercel.app',
        'X-Title': 'ErrorCodeWiki Admin Connection Test',
      },
      body: JSON.stringify({
        model: 'google/gemma-4-31b-it:free',
        messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
        max_tokens: 8,
        temperature: 0,
      }),
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      const status = response.status === 401 || response.status === 403
        ? 'invalid_key'
        : response.status === 429
          ? 'rate_limited'
          : response.status === 402
            ? 'credits_required'
            : 'provider_error';
      const friendly = status === 'invalid_key'
        ? 'OpenRouter rejected the API key. Check that the key is correct and enabled.'
        : status === 'rate_limited'
          ? 'OpenRouter rate-limited the test. Wait a little and try again.'
          : status === 'credits_required'
            ? 'OpenRouter says credits or billing are required for this request.'
            : `OpenRouter returned HTTP ${response.status}. Check the provider details.`;
      return NextResponse.json({ success: false, status, error: friendly, providerStatus: response.status, detail }, { status: 502 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) {
      return NextResponse.json({ success: false, status: 'empty_response', error: 'OpenRouter accepted the request but returned an empty response.' }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      status: 'connected',
      message: 'OpenRouter API key is valid and the test model returned a response.',
      model: data.model || 'google/gemma-4-31b-it:free',
    });
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return NextResponse.json({
      success: false,
      status: aborted ? 'timeout' : 'connection_error',
      error: aborted ? 'OpenRouter connection test timed out after 15 seconds.' : 'Could not reach OpenRouter. Check the deployment network and try again.',
    }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }
}

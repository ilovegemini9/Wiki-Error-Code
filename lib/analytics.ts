import { supabaseAdmin } from '@/lib/supabase';

function getSource(referrerHost: string | null, utmSource: string | null) {
  if (utmSource) return utmSource.toLowerCase();
  if (!referrerHost) return 'direct';
  const host = referrerHost.toLowerCase().replace(/^www\./, '');
  if (host.includes('google.')) return 'google';
  if (host.includes('bing.com')) return 'bing';
  if (host.includes('yahoo.')) return 'yahoo';
  if (host.includes('duckduckgo.com')) return 'duckduckgo';
  if (host.includes('facebook.com') || host.includes('fb.com')) return 'facebook';
  if (host.includes('instagram.com')) return 'instagram';
  if (host.includes('t.co') || host.includes('twitter.com') || host.includes('x.com')) return 'x';
  if (host.includes('youtube.com') || host.includes('youtu.be')) return 'youtube';
  return host;
}

function getSearchEngine(host: string | null) {
  if (!host) return null;
  const h = host.toLowerCase();
  if (h.includes('google.')) return 'Google';
  if (h.includes('bing.com')) return 'Bing';
  if (h.includes('yahoo.')) return 'Yahoo';
  if (h.includes('duckduckgo.com')) return 'DuckDuckGo';
  if (h.includes('ecosia.org')) return 'Ecosia';
  if (h.includes('brave.com')) return 'Brave Search';
  return null;
}

function getKeyword(referrer: string | null, searchEngine: string | null) {
  if (!referrer || !searchEngine) return null;
  try {
    const url = new URL(referrer);
    for (const key of ['q', 'query', 'p', 'text']) {
      const value = url.searchParams.get(key)?.trim();
      if (value && value.length <= 200) return value;
    }
  } catch {}
  return null;
}

export function normalizeAnalyticsEvent(input: Record<string, unknown>) {
  const referrer = typeof input.referrer === 'string' ? input.referrer : null;
  let referrerHost: string | null = null;
  try { referrerHost = referrer ? new URL(referrer).hostname : null; } catch {}
  const searchEngine = getSearchEngine(referrerHost);
  return {
    session_id: String(input.sessionId || '').slice(0, 100),
    event_name: String(input.eventName || 'page_view').slice(0, 80),
    path: String(input.path || '').slice(0, 500),
    landing_path: String(input.landingPath || '').slice(0, 500),
    referrer: referrerHost,
    referrer_host: referrerHost,
    source: getSource(referrerHost, typeof input.utmSource === 'string' ? input.utmSource : null),
    medium: typeof input.utmMedium === 'string' ? input.utmMedium.slice(0, 80) : (referrerHost ? 'referral' : 'direct'),
    campaign: typeof input.utmCampaign === 'string' ? input.utmCampaign.slice(0, 120) : null,
    search_engine: searchEngine,
    search_keyword: getKeyword(referrer, searchEngine),
    country_code: typeof input.countryCode === 'string' ? input.countryCode.slice(0, 8).toUpperCase() : null,
    region: typeof input.region === 'string' ? input.region.slice(0, 120) : null,
    device_type: typeof input.deviceType === 'string' ? input.deviceType.slice(0, 20) : null,
    browser: typeof input.browser === 'string' ? input.browser.slice(0, 40) : null,
    os: typeof input.os === 'string' ? input.os.slice(0, 40) : null,
    user_agent: typeof input.userAgent === 'string' ? input.userAgent.slice(0, 500) : null,
    screen_width: Number.isFinite(Number(input.screenWidth)) ? Number(input.screenWidth) : null,
    screen_height: Number.isFinite(Number(input.screenHeight)) ? Number(input.screenHeight) : null,
    language: typeof input.language === 'string' ? input.language.slice(0, 20) : null,
    page_title: typeof input.pageTitle === 'string' ? input.pageTitle.slice(0, 300) : null,
    article_id: typeof input.articleId === 'string' ? input.articleId.slice(0, 120) : null,
    metadata: typeof input.metadata === 'object' && input.metadata ? input.metadata : {},
  };
}

export async function recordAnalyticsEvent(input: Record<string, unknown>) {
  if (!supabaseAdmin) return;
  const event = normalizeAnalyticsEvent(input);
  if (!event.session_id || !event.path) return;
  const { error } = await (supabaseAdmin as any).from('analytics_events').insert(event);
  if (error) throw error;
}

export async function getAnalyticsSummary(days = 30) {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.');
  const since = new Date(Date.now() - Math.max(1, Math.min(days, 365)) * 86400000).toISOString();
  const { data, error } = await (supabaseAdmin as any)
    .from('analytics_events')
    .select('created_at,session_id,path,landing_path,referrer_host,source,medium,campaign,search_engine,search_keyword,country_code,region,device_type,browser,os,screen_width,language,article_id,event_name')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(20000);
  if (error) throw error;
  const rows: Array<Record<string, unknown>> = Array.isArray(data) ? data : [];
  const unique = (field: string) => new Set(rows.map((r) => r[field]).filter(Boolean)).size;
  const countBy = (field: string, limit = 12) => {
    const counts: Record<string, number> = {};
    for (const r of rows) {
      const raw = r[field];
      const key = raw == null || raw === '' ? 'Unknown' : String(raw);
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, count]) => ({ name, count }));
  };
  const sessions = new Set(rows.map((r) => r.session_id).filter((value): value is string => typeof value === 'string' && value.length > 0));
  const dayMap: Record<string, { views: number; sessions: Set<string> }> = {};
  for (const r of rows) {
    const day = String(r.created_at || '').slice(0, 10);
    if (!day) continue;
    dayMap[day] ||= { views: 0, sessions: new Set() };
    dayMap[day].views++;
    if (typeof r.session_id === 'string' && r.session_id) dayMap[day].sessions.add(r.session_id);
  }
  const daily = Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, views: v.views, sessions: v.sessions.size }));
  const keywordCounts: Record<string, number> = {};
  for (const r of rows) {
    if (typeof r.search_keyword === 'string' && r.search_keyword) keywordCounts[r.search_keyword] = (keywordCounts[r.search_keyword] || 0) + 1;
  }
  return {
    days,
    pageViews: rows.filter((r) => r.event_name === 'page_view').length,
    uniqueVisitors: sessions.size,
    uniquePages: unique('path'),
    sources: countBy('source'),
    referrers: countBy('referrer_host'),
    countries: countBy('country_code'),
    devices: countBy('device_type'),
    browsers: countBy('browser'),
    operatingSystems: countBy('os'),
    searchEngines: countBy('search_engine'),
    keywords: Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]).slice(0, 20).map(([name, count]) => ({ name, count })),
    topPages: countBy('path', 15),
    campaigns: countBy('campaign', 10),
    daily,
  };
}

import { supabaseAdmin } from '@/lib/supabase';

function today() { return new Date().toISOString().slice(0, 10); }

export async function recordAnalyticsEvent(input: Record<string, unknown>) {
  if (!supabaseAdmin) return;
  const calculatorId = typeof input.calculatorId === 'string' ? input.calculatorId.slice(0, 120) : typeof input.path === 'string' ? input.path.slice(0, 500) : 'site';
  const eventName = typeof input.eventName === 'string' ? input.eventName : 'page_view';
  const date = today();
  const client = supabaseAdmin as any;
  const { data: existing, error: readError } = await client.from('analytics').select('id,page_views,unique_visits,calc_usages,bounce_rate,avg_duration').eq('calculator_id', calculatorId).eq('date', date).maybeSingle();
  if (readError) throw readError;

  const duration = typeof input.duration === 'number' && Number.isFinite(input.duration) ? Math.max(0, input.duration) : 0;
  const isPageView = eventName === 'page_view';
  const isUsage = eventName === 'calculator_use';
  const isSession = eventName === 'session_start' || typeof input.sessionId === 'string';
  const previousViews = Number(existing?.page_views || 0);
  const previousDuration = Number(existing?.avg_duration || 0);
  const nextViews = previousViews + (isPageView ? 1 : 0);
  const nextDuration = duration > 0 ? ((previousDuration * previousViews) + duration) / Math.max(nextViews, 1) : previousDuration;

  const row = {
    id: existing?.id || `${calculatorId}-${date}`,
    calculator_id: calculatorId,
    date,
    page_views: nextViews,
    unique_visits: Number(existing?.unique_visits || 0) + (isSession ? 1 : 0),
    calc_usages: Number(existing?.calc_usages || 0) + (isUsage ? 1 : 0),
    bounce_rate: Number(existing?.bounce_rate || 0),
    avg_duration: nextDuration,
  };
  const { error } = await client.from('analytics').upsert(row, { onConflict: 'id' });
  if (error) throw error;
}

export async function getAnalyticsSummary(days = 30) {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.');
  const safeDays = Math.max(1, Math.min(days, 365));
  const since = new Date(Date.now() - (safeDays - 1) * 86400000).toISOString().slice(0, 10);
  const todayDate = today();
  const { data, error } = await (supabaseAdmin as any).from('analytics').select('id,calculator_id,date,page_views,unique_visits,calc_usages,bounce_rate,avg_duration').gte('date', since).lte('date', todayDate).order('date', { ascending: true }).limit(20000);
  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  const total = (field: string) => rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
  const grouped = (field: string, valueField: string, limit = 15) => {
    const groups: Record<string, number> = {};
    for (const row of rows) {
      const key = String(row[field] || 'Unknown');
      groups[key] = (groups[key] || 0) + Number(row[valueField] || 0);
    }
    return Object.entries(groups).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
  };
  const dailyMap: Record<string, { views: number; sessions: number; usages: number }> = {};
  for (const row of rows) {
    const key = String(row.date);
    dailyMap[key] ||= { views: 0, sessions: 0, usages: 0 };
    dailyMap[key].views += Number(row.page_views || 0);
    dailyMap[key].sessions += Number(row.unique_visits || 0);
    dailyMap[key].usages += Number(row.calc_usages || 0);
  }

  const pageViews = total('page_views');
  const uniqueVisitors = total('unique_visits');
  const usages = total('calc_usages');
  return {
    days: safeDays,
    pageViews,
    uniqueVisitors,
    uniquePages: new Set(rows.map((row) => row.calculator_id).filter(Boolean)).size,
    sources: [{ name: 'First-party analytics', count: pageViews }],
    referrers: [], countries: [], devices: [], browsers: [], operatingSystems: [], searchEngines: [], keywords: [], campaigns: [],
    topPages: grouped('calculator_id', 'page_views'),
    calculators: grouped('calculator_id', 'page_views'),
    daily: Object.entries(dailyMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, values]) => ({ date, views: values.views, sessions: values.sessions })),
    calculatorUsages: usages,
    averageBounceRate: rows.length ? rows.reduce((sum, row) => sum + Number(row.bounce_rate || 0), 0) / rows.length : 0,
    averageDuration: rows.length ? rows.reduce((sum, row) => sum + Number(row.avg_duration || 0), 0) / rows.length : 0,
  };
}

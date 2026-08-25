import { supabaseAdmin } from '@/lib/supabase';

export async function recordAnalyticsEvent(input: Record<string, unknown>) {
  if (!supabaseAdmin) return;
  const calculatorId = typeof input.calculatorId === 'string' ? input.calculatorId.slice(0, 120) : typeof input.path === 'string' ? input.path.slice(0, 500) : 'unknown';
  const eventName = typeof input.eventName === 'string' ? input.eventName : 'page_view';
  const { data: existing } = await (supabaseAdmin as any).from('analytics').select('id,page_views,unique_visits,calc_usages').eq('calculator_id', calculatorId).eq('date', new Date().toISOString().slice(0, 10)).maybeSingle();
  const next = {
    id: existing?.id || `${calculatorId}-${new Date().toISOString().slice(0, 10)}`,
    calculator_id: calculatorId,
    date: new Date().toISOString().slice(0, 10),
    page_views: Number(existing?.page_views || 0) + (eventName === 'page_view' ? 1 : 0),
    unique_visits: Number(existing?.unique_visits || 0),
    calc_usages: Number(existing?.calc_usages || 0) + (eventName === 'calculator_use' ? 1 : 0),
    bounce_rate: Number(existing?.bounce_rate || 0),
    avg_duration: Number(existing?.avg_duration || 0),
  };
  const { error } = await (supabaseAdmin as any).from('analytics').upsert(next, { onConflict: 'id' });
  if (error) throw error;
}

export async function getAnalyticsSummary(days = 30) {
  if (!supabaseAdmin) throw new Error('Supabase is not configured.');
  const safeDays = Math.max(1, Math.min(days, 365));
  const since = new Date(Date.now() - safeDays * 86400000).toISOString().slice(0, 10);
  const { data, error } = await (supabaseAdmin as any)
    .from('analytics')
    .select('id,calculator_id,date,page_views,unique_visits,calc_usages,bounce_rate,avg_duration')
    .gte('date', since)
    .order('date', { ascending: true })
    .limit(20000);
  if (error) throw error;

  const rows = Array.isArray(data) ? data : [];
  const total = (field: string) => rows.reduce((sum, row) => sum + Number(row[field] || 0), 0);
  const countBy = (field: string, limit = 12) => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const key = String(row[field] || 'Unknown');
      counts[key] = (counts[key] || 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, count]) => ({ name, count }));
  };

  const daily = rows.map((row) => ({ date: String(row.date), views: Number(row.page_views || 0), sessions: Number(row.unique_visits || 0) }));
  const topPages = [...rows].sort((a, b) => Number(b.page_views || 0) - Number(a.page_views || 0)).slice(0, 15).map((row) => ({ name: String(row.calculator_id || 'Unknown'), count: Number(row.page_views || 0) }));
  const calculators = countBy('calculator_id', 15);
  const uniqueCalculators = new Set(rows.map((row) => row.calculator_id).filter(Boolean)).size;
  const pageViews = total('page_views');
  const uniqueVisitors = total('unique_visits');

  return {
    days: safeDays,
    pageViews,
    uniqueVisitors,
    uniquePages: uniqueCalculators,
    sources: [{ name: 'First-party analytics', count: pageViews }],
    referrers: [],
    countries: [],
    devices: [],
    browsers: [],
    operatingSystems: [],
    searchEngines: [],
    keywords: [],
    topPages,
    campaigns: [],
    daily,
    calculators,
    calculatorUsages: total('calc_usages'),
    averageBounceRate: rows.length ? rows.reduce((sum, row) => sum + Number(row.bounce_rate || 0), 0) / rows.length : 0,
    averageDuration: rows.length ? rows.reduce((sum, row) => sum + Number(row.avg_duration || 0), 0) / rows.length : 0,
  };
}

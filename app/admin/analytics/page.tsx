import { redirect } from 'next/navigation';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getAnalyticsSummary } from '@/lib/analytics';
import { BarChart3, Users, Eye, Calculator, Activity, Clock } from 'lucide-react';

type CountRow = { name: string; count: number };

export const dynamic = 'force-dynamic';

function Table({ title, icon: Icon, rows }: { title: string; icon: typeof BarChart3; rows: CountRow[] }) {
  return <section className="border border-gray-300 bg-white rounded-xs"><div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2"><Icon className="w-4 h-4 text-blue-700" /><h2 className="font-serif font-bold text-sm">{title}</h2></div><div className="divide-y divide-gray-100">{rows.length ? rows.map((r) => <div key={r.name} className="px-3 py-2 flex items-center justify-between text-xs"><span className="truncate pr-4">{r.name}</span><span className="font-mono font-bold text-gray-700">{r.count.toLocaleString()}</span></div>) : <div className="p-4 text-xs text-gray-500">No data yet.</div>}</div></section>;
}

export default async function AnalyticsPage() {
  if (!(await isAuthenticatedAdmin())) redirect('/admin/login');
  try {
    const data = await getAnalyticsSummary(30);
    const dailyMap = new Map<string, { views: number; sessions: number }>();
    for (const row of data.daily) {
      const current = dailyMap.get(row.date) || { views: 0, sessions: 0 };
      current.views += Number(row.views) || 0;
      current.sessions += Number(row.sessions) || 0;
      dailyMap.set(row.date, current);
    }
    const daily = Array.from(dailyMap.entries()).map(([date, value]) => ({ date, ...value }));
    const maxViews = Math.max(1, ...daily.map((d) => d.views));
    const calculatorRows = data.calculators.map((row) => ({ name: row.name, count: Number(row.count) || 0 }));
    return <div className="space-y-6 max-w-7xl">
      <div className="border-b border-gray-200 pb-4"><h1 className="font-serif text-2xl font-bold">Analytics</h1><p className="text-xs text-gray-500 font-mono mt-1">calculatoAi2 first-party analytics · last 30 days</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[[Eye,'Page views',data.pageViews],[Users,'Unique visits',data.uniqueVisitors],[Calculator,'Calculators tracked',data.uniquePages],[Activity,'Calculator uses',data.calculatorUsages],[Clock,'Avg. duration',`${Math.round(data.averageDuration)}s`]].map(([I,label,value]) => { const Icon = I as typeof Eye; return <div key={String(label)} className="p-4 bg-white border border-gray-300 rounded-xs"><Icon className="w-4 h-4 text-blue-700"/><div className="text-[10px] uppercase text-gray-500 font-semibold mt-2">{String(label)}</div><div className="text-2xl font-serif font-bold mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</div></div>; })}
      </div>
      <section className="border border-gray-300 bg-white rounded-xs p-4"><h2 className="font-serif font-bold text-sm mb-4">Traffic trend</h2><div className="grid grid-cols-7 md:grid-cols-15 lg:grid-cols-30 gap-1 items-end h-40">{daily.map((d) => <div key={d.date} className="h-full flex flex-col justify-end" title={`${d.date}: ${d.views} views / ${d.sessions} visits`}><div className="bg-blue-600 min-h-1 rounded-t" style={{height:`${Math.max(2, Math.round((d.views / maxViews) * 100))}%`}} /><div className="text-[7px] text-gray-400 mt-1 rotate-45 origin-left whitespace-nowrap">{d.date.slice(5)}</div></div>)}</div></section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><Table title="Calculator page views" icon={BarChart3} rows={calculatorRows}/><Table title="Analytics source" icon={Activity} rows={[{ name: 'First-party calculatoAi2 analytics', count: data.pageViews }]}/></div>
      <section className="border border-gray-200 bg-gray-50 p-4 rounded-xs text-xs text-gray-700"><strong>Data scope:</strong> This dashboard uses the existing <code>analytics</code> table in the calculatoAi2 Supabase project. It does not invent referrers, countries, browsers, search keywords, or other dimensions that are not stored by the current schema.</section>
    </div>;
  } catch (error) {
    console.error('Admin analytics failed:', error);
    return <div className="max-w-3xl border border-red-200 bg-red-50 p-6 rounded-xs"><h1 className="font-serif text-xl font-bold text-red-900">Analytics unavailable</h1><p className="mt-2 text-sm text-red-800">The analytics dashboard could not read the calculatoAi2 analytics table. Check the Supabase connection and database permissions.</p></div>;
  }
}

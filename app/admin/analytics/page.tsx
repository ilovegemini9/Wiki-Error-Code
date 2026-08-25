import { redirect } from 'next/navigation';
import { isAuthenticatedAdmin } from '@/lib/auth';
import { getAnalyticsSummary } from '@/lib/analytics';
import { BarChart3, Users, Eye, Globe2, Search, ExternalLink, Monitor, Smartphone } from 'lucide-react';

export const dynamic = 'force-dynamic';

function Table({ title, icon: Icon, rows }: { title: string; icon: any; rows: { name: string; count: number }[] }) {
  return <section className="border border-gray-300 bg-white rounded-xs"><div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2"><Icon className="w-4 h-4 text-blue-700" /><h2 className="font-serif font-bold text-sm">{title}</h2></div><div className="divide-y divide-gray-100">{rows.length ? rows.map((r) => <div key={r.name} className="px-3 py-2 flex items-center justify-between text-xs"><span className="truncate pr-4">{r.name}</span><span className="font-mono font-bold text-gray-700">{r.count.toLocaleString()}</span></div>) : <div className="p-4 text-xs text-gray-500">No data yet.</div>}</div></section>;
}

export default async function AnalyticsPage() {
  if (!(await isAuthenticatedAdmin())) redirect('/admin/login');
  const data = await getAnalyticsSummary(30);
  return <div className="space-y-6 max-w-7xl">
    <div className="border-b border-gray-200 pb-4"><h1 className="font-serif text-2xl font-bold">Analytics</h1><p className="text-xs text-gray-500 font-mono mt-1">Real first-party traffic data · last 30 days · anonymous sessions</p></div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[[Eye,'Page views',data.pageViews],[Users,'Unique visitors',data.uniqueVisitors],[BarChart3,'Pages viewed',data.uniquePages],[Globe2,'Countries',data.countries.length]].map(([I,label,value]) => <div key={String(label)} className="p-4 bg-white border border-gray-300 rounded-xs"><I className="w-4 h-4 text-blue-700"/><div className="text-[10px] uppercase text-gray-500 font-semibold mt-2">{String(label)}</div><div className="text-2xl font-serif font-bold mt-1">{Number(value).toLocaleString()}</div></div>)}
    </div>
    <section className="border border-gray-300 bg-white rounded-xs p-4"><h2 className="font-serif font-bold text-sm mb-4">Traffic trend</h2><div className="grid grid-cols-7 md:grid-cols-15 lg:grid-cols-30 gap-1 items-end h-40">{data.daily.map((d) => <div key={d.date} className="h-full flex flex-col justify-end" title={`${d.date}: ${d.views} views / ${d.sessions} visitors`}><div className="bg-blue-600 min-h-1 rounded-t" style={{height:`${Math.max(2, Math.round((d.views / Math.max(1,...data.daily.map(x=>x.views))) * 100))}%`}} /><div className="text-[7px] text-gray-400 mt-1 rotate-45 origin-left whitespace-nowrap">{d.date.slice(5)}</div></div>)}</div></section>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Table title="Traffic sources" icon={ExternalLink} rows={data.sources}/>
      <Table title="Referrers" icon={ExternalLink} rows={data.referrers}/>
      <Table title="Countries" icon={Globe2} rows={data.countries}/>
      <Table title="Search engines" icon={Search} rows={data.searchEngines}/>
      <Table title="Search keywords captured" icon={Search} rows={data.keywords}/>
      <Table title="Top pages" icon={BarChart3} rows={data.topPages}/>
      <Table title="Devices" icon={Monitor} rows={data.devices}/>
      <Table title="Browsers" icon={Monitor} rows={data.browsers}/>
      <Table title="Operating systems" icon={Smartphone} rows={data.operatingSystems}/>
    </div>
    <section className="border border-amber-200 bg-amber-50 p-4 rounded-xs text-xs text-amber-900"><strong>Keyword note:</strong> Google often removes the search query from the browser referrer. The table above captures keywords when the search engine sends them (Bing/Yahoo/DuckDuckGo/etc.). Exact Google organic queries require Google Search Console data; this dashboard does not invent or guess those keywords.</section>
  </div>;
}

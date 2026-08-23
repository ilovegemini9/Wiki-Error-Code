import Link from 'next/link';
import { getSupabaseArticles, getSupabaseBrands, getSupabaseCategories } from '@/lib/supabase-db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Search, Monitor, Printer, Car, Gamepad2, Code, Database, Smartphone, Terminal, Network, Apple, ArrowRight, ShieldCheck, Clock, BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'ErrorCodeWiki - The Free Error Code Diagnostic Manual',
  description: 'A searchable database of error codes for Windows, Linux, Printers, Cars (OBD-II), Gaming Consoles, HTTP status codes, and Databases.',
};

const CATEGORY_ICONS: Record<string, any> = { windows: Monitor, linux: Terminal, android: Smartphone, iphone: Apple, printers: Printer, cars: Car, gaming: Gamepad2, networking: Network, programming: Code, database: Database };

export default async function HomePage() {
  const [{ articles: allArticles }, categories, brands, { articles: latestArticles }, { articles: popularArticles }] = await Promise.all([
    getSupabaseArticles({ status: 'published', language: 'en' }),
    getSupabaseCategories('en'),
    getSupabaseBrands('en'),
    getSupabaseArticles({ status: 'published', language: 'en' }),
    getSupabaseArticles({ status: 'published', language: 'en' })
  ]);

  const latest = latestArticles.slice(0, 8);
  const popular = [...popularArticles].sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0)).slice(0, 6);
  const categoryCounts = allArticles.reduce<Record<string, number>>((acc, article) => {
    acc[article.categoryId] = (acc[article.categoryId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[]} />

        <section className="my-6 p-6 sm:p-8 bg-[#f8f9fa] border border-[#a2a9b1] rounded-xs shadow-2xs">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-800 text-xs font-mono font-semibold rounded-xs border border-blue-200"><ShieldCheck className="w-3.5 h-3.5 text-blue-700" />Verified Fixes • Step-by-Step Solutions • Open Index</div>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-snug">Universal Diagnostic Error Code Manual</h1>
            <p className="text-sm text-gray-600 leading-relaxed font-sans max-w-2xl mx-auto">Welcome to <strong className="font-semibold text-gray-800">ErrorCodeWiki</strong>. Search documented fault codes, Blue Screens of Death (BSOD), OBD-II engine codes, printer hardware errors, and HTTP server exceptions.</p>
            <form action="/search" method="GET" className="pt-2 max-w-2xl mx-auto">
              <div className="relative flex items-center shadow-xs"><input type="text" name="q" placeholder="Enter error code (e.g. 0x80070005, E-01, P0420, 404, CE-34878-0)..." className="w-full bg-white border-2 border-gray-400 text-gray-900 text-base rounded-xs pl-4 pr-28 py-3 font-mono focus:outline-none focus:border-blue-700 transition-colors" required /><button type="submit" className="absolute right-1 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-medium text-sm rounded-xs flex items-center gap-1.5 transition-colors"><Search className="w-4 h-4" />Search</button></div>
              <div className="mt-2 text-xs text-gray-500 font-mono flex items-center justify-center gap-2 flex-wrap"><span className="text-gray-400">Popular:</span><Link href="/error/windows-0x80070005" className="text-blue-700 hover:underline">0x80070005</Link><span>•</span><Link href="/error/epson-e01" className="text-blue-700 hover:underline">Epson E-01</Link><span>•</span><Link href="/error/toyota-p0420" className="text-blue-700 hover:underline">Toyota P0420</Link><span>•</span><Link href="/error/http-404" className="text-blue-700 hover:underline">HTTP 404</Link></div>
            </form>
          </div>
        </section>

        <section className="my-10">
          <div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4"><h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-gray-700" />Categories Directory</h2><span className="text-xs text-gray-500 font-mono">{categories.length} Specialized Manuals</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {categories.map((cat) => { const IconComponent = CATEGORY_ICONS[cat.id] || Monitor; const count = categoryCounts[cat.id] || categoryCounts[cat.slug] || 0; return <Link key={cat.id} href={`/category/${cat.slug}`} className="p-3.5 bg-white border border-gray-200 hover:border-blue-600 hover:shadow-xs transition-all rounded-xs group flex flex-col justify-between"><div><div className="flex items-center gap-2 mb-1.5"><div className="p-1.5 bg-gray-100 text-gray-800 group-hover:bg-blue-100 group-hover:text-blue-800 rounded-xs transition-colors"><IconComponent className="w-4 h-4" /></div><h3 className="font-serif font-bold text-sm text-gray-900 group-hover:text-blue-700">{cat.name}</h3></div><p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{cat.description}</p></div><div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-blue-700 font-medium flex items-center justify-between"><span>{count} Error Guides</span><ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" /></div></Link>; })}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 my-10">
          <div className="lg:col-span-2 space-y-8">
            <section><div className="flex items-center justify-between border-b border-gray-300 pb-2 mb-4"><h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2"><Clock className="w-4 h-4 text-gray-700" />Latest Documented Error Codes</h2><Link href="/search" className="text-xs text-blue-700 hover:underline font-medium">View All Database →</Link></div><div className="divide-y divide-gray-200 border border-gray-200 bg-white rounded-xs">{latest.map(art => <article key={art.id} className="p-4 hover:bg-gray-50 transition-colors"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-900 text-white rounded-xs">{art.errorCode}</span><span className="text-xs text-gray-500 font-mono">{art.deviceType}</span></div><h3 className="font-serif font-bold text-base text-gray-900 hover:text-blue-700"><Link href={`/error/${art.slug}`}>{art.title}</Link></h3><p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{art.shortDefinition}</p></div><Link href={`/error/${art.slug}`} className="shrink-0 px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-xs">Read Fix</Link></div></article>)}</div></section>
            <section className="bg-[#f8f9fa] border border-[#a2a9b1] p-5 rounded-xs"><h2 className="font-serif text-base font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1.5">Popular Equipment Brands &amp; Hardware</h2><div className="flex flex-wrap gap-2 text-xs">{brands.map(b => <Link key={b.id} href={`/brand/${b.slug}`} className="px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-600 hover:text-blue-700 font-medium text-gray-800 rounded-xs transition-colors shadow-2xs">{b.name}</Link>)}</div></section>
          </div>

          <aside className="space-y-6">
            <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-4 text-xs font-sans text-gray-800 rounded-xs space-y-3"><div className="font-serif font-bold text-sm border-b border-gray-300 pb-1 text-gray-900">Did You Know?</div><p className="leading-relaxed">Error codes originate from early computing system assembly traps. Modern hexadecimal codes contain both subsystem and status information.</p><div className="pt-2 border-t border-gray-200 text-gray-600 font-mono text-[11px]">Facility 0x007 = Win32 Subsystem<br />Code 0x0005 = Access Denied</div></div>
            <div className="bg-white border border-gray-300 p-4 rounded-xs"><div className="font-serif font-bold text-sm border-b border-gray-200 pb-1.5 mb-3 text-gray-900">Most Frequently Searched</div><ul className="space-y-2 text-xs">{popular.map(art => <li key={art.id} className="border-b border-gray-100 pb-1.5 last:border-0 last:pb-0"><Link href={`/error/${art.slug}`} className="font-medium text-blue-700 hover:underline block">{art.errorCode}: {art.title}</Link><span className="text-[10px] text-gray-500 font-mono">{art.viewsCount || 0}+ views</span></li>)}</ul></div>
            <div className="bg-gray-900 text-white p-4 rounded-xs text-xs space-y-2"><div className="font-bold text-sm font-serif">Error Code Administrator</div><p className="text-gray-300 text-[11px] leading-relaxed">Authorized contributors can generate new error articles with AI, import bulk CSV files, or edit documentation in the admin dashboard.</p><Link href="/admin/login" className="inline-block mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs rounded-xs">Access Admin Portal →</Link></div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}

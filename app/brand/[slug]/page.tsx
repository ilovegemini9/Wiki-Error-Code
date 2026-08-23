import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseArticles, getSupabaseBrandBySlug } from '@/lib/supabase-db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Tag } from 'lucide-react';

interface BrandPageProps { params: Promise<{ slug: string }> }
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await getSupabaseBrandBySlug(slug);
  if (!brand) return { title: 'Brand Not Found - ErrorCodeWiki' };
  return { title: `${brand.name} Error Codes & Diagnostics - ErrorCodeWiki`, description: brand.description || `Database of error codes, fault messages, and solutions for ${brand.name} equipment.` };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = await getSupabaseBrandBySlug(slug);
  if (!brand) notFound();
  const { articles, total } = await getSupabaseArticles({ status: 'published', brandSlug: slug, language: 'en' });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[{ label: 'Brands', href: '/search' }, { label: brand.name }]} />
        <div className="my-4 pb-4 border-b border-gray-300 bg-[#f8f9fa] border p-6 rounded-xs">
          <div className="flex items-center gap-3 mb-2"><div className="p-2 bg-blue-900 text-white rounded-xs"><Tag className="w-5 h-5" /></div><div><h1 className="font-serif text-2xl font-bold text-gray-900">{brand.name} Fault Code Manuals</h1><p className="text-xs text-gray-600 font-mono mt-0.5">{total} Documented {brand.name} Errors</p></div></div>
          <p className="text-xs text-gray-700 leading-relaxed max-w-3xl">{brand.description}</p>
          <div className="mt-3 text-xs text-gray-600 font-mono flex items-center gap-2"><span className="font-bold text-gray-800">Supported Device Hardware:</span><span>{brand.deviceTypes.join(', ')}</span></div>
        </div>
        <div className="my-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">{brand.name} Articles &amp; Diagnostic Guides</h2>
          {articles.length === 0 ? <div className="p-8 text-center bg-gray-50 border border-gray-200 text-xs text-gray-600">No error codes listed under {brand.name} yet.</div> : <div className="divide-y divide-gray-200 border border-gray-300 bg-white rounded-xs">{articles.map(art => <article key={art.id} className="p-4 hover:bg-gray-50 transition-colors"><div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 mb-1"><span className="font-mono text-xs font-bold px-2 py-0.5 bg-blue-900 text-white rounded-xs">{art.errorCode}</span><span className="text-xs text-gray-500 font-mono">{art.deviceType}</span></div><h3 className="font-serif font-bold text-base text-gray-900 hover:text-blue-700"><Link href={`/error/${art.slug}`}>{art.title}</Link></h3><p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">{art.shortDefinition}</p></div><Link href={`/error/${art.slug}`} className="shrink-0 px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-800 hover:bg-gray-100 rounded-xs">Read Fix</Link></div></article>)}</div>}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseArticles, getSupabaseCategoryBySlug } from '@/lib/supabase-db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getLanguageByCode, SUPPORTED_LANGUAGES } from '@/lib/languages';
import { BookOpen, ArrowRight } from 'lucide-react';

interface LangCategoryPageProps { params: Promise<{ lang: string; slug: string }> }
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LangCategoryPageProps) {
  const { lang, slug } = await params;
  const langObj = getLanguageByCode(lang);
  const category = await getSupabaseCategoryBySlug(slug, lang);
  if (!category) return { title: 'Category Not Found - ErrorCodeWiki' };
  return { title: `${category.name} Error Codes (${langObj.name}) - ErrorCodeWiki`, description: category.description || `Database of documented error codes, fault messages, and fixes for ${category.name} in ${langObj.name}.` };
}

export default async function LangCategoryPage({ params }: LangCategoryPageProps) {
  const { lang, slug } = await params;
  const langObj = getLanguageByCode(lang);
  if (!SUPPORTED_LANGUAGES.some(l => l.code === lang.toLowerCase())) notFound();
  const category = await getSupabaseCategoryBySlug(slug, lang);
  if (!category) notFound();
  const { articles } = await getSupabaseArticles({ status: 'published', categorySlug: slug, language: lang });
  return <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col"><Navbar/><main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4"><Breadcrumbs items={[{label:'Categories',href:`/${lang}`},{label:`${category.name} (${langObj.flag} ${langObj.name})`}]}/><div className="my-4 pb-4 border-b border-gray-300 bg-[#f8f9fa] p-6 rounded-xs"><div className="flex items-center gap-3"><div className="p-2 bg-gray-900 text-white rounded-xs"><BookOpen className="w-5 h-5"/></div><div><div className="flex items-center gap-2"><h1 className="font-serif text-2xl font-bold">{category.name} Error Codes Directory</h1><span className="text-xs font-mono font-bold bg-amber-400 text-gray-950 px-2 py-0.5 rounded-xs">{langObj.flag} {langObj.name}</span></div><p className="text-xs text-gray-600 mt-1">{category.description}</p></div></div></div><section className="my-6">{articles.length===0?<div className="p-8 text-center bg-gray-50 border border-gray-200 text-xs text-gray-600 rounded-xs">No articles documented in <strong>{langObj.name}</strong> under {category.name} yet.</div>:<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{articles.map(art=><Link key={art.id} href={`/${lang}/error/${art.slug}`} className="group border border-gray-300 p-4 rounded-xs bg-white hover:border-blue-600 hover:shadow-md transition-all flex flex-col justify-between"><div><div className="flex items-center justify-between gap-2 mb-2"><span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-mono font-bold rounded-xs">{art.errorCode}</span><span className="text-[10px] font-mono text-gray-500">{art.deviceType||category.name}</span></div><h3 className="font-serif font-bold text-base group-hover:text-blue-700 line-clamp-2">{art.title}</h3><p className="text-xs text-gray-600 mt-2 line-clamp-3">{art.shortDefinition}</p></div><div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono"><span>{art.readingTime||'4 min read'}</span><span className="text-blue-700 font-bold flex items-center gap-1">Read Guide <ArrowRight className="w-3 h-3"/></span></div></Link>)}</div>}</section></main><Footer/></div>;
}

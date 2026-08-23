import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabaseArticleBySlug, getSupabaseArticles, getSupabaseBrandBySlug, getSupabaseCategoryBySlug, getSupabaseSettings, incrementSupabaseArticleViews } from '@/lib/supabase-db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Infobox } from '@/components/Infobox';
import { getLanguageByCode, SUPPORTED_LANGUAGES } from '@/lib/languages';
import { HelpCircle, AlertTriangle, Terminal, ShieldAlert, Cpu, Share2, Check } from 'lucide-react';

interface LangErrorPageProps { params: Promise<{ lang: string; slug: string }> }
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LangErrorPageProps) {
  const { lang, slug } = await params; const langObj = getLanguageByCode(lang); const article = await getSupabaseArticleBySlug(slug);
  if (!article) return { title: 'Error Code Not Found - ErrorCodeWiki', description: 'The requested error code manual does not exist in our database.' };
  const settings = await getSupabaseSettings(); const siteUrl = settings.siteUrl || 'https://errorcodewiki.org'; const canonical = article.canonicalUrl || `${siteUrl}/${lang}/error/${article.slug}`;
  const languages: Record<string,string> = { 'x-default': `${siteUrl}/error/${article.slug}` }; SUPPORTED_LANGUAGES.forEach(l => { languages[l.code] = l.code === 'en' ? `${siteUrl}/error/${article.slug}` : `${siteUrl}/${l.code}/error/${article.slug}`; });
  return { title: article.metaTitle || `${article.title} - ${langObj.name}`, description: article.metaDescription || article.shortDefinition, alternates: { canonical, languages }, openGraph: { title: article.metaTitle || article.title, description: article.metaDescription || article.shortDefinition, url: canonical, type: 'article', siteName: settings.siteName || 'ErrorCodeWiki', publishedTime: article.createdAt, modifiedTime: article.updatedAt, tags: article.tags } };
}

export default async function LangErrorArticlePage({ params }: LangErrorPageProps) {
  const { lang, slug } = await params; const langObj = getLanguageByCode(lang);
  if (!SUPPORTED_LANGUAGES.some(l => l.code === lang.toLowerCase())) notFound();
  const article = await getSupabaseArticleBySlug(slug);
  if (!article || article.language.toLowerCase() !== lang.toLowerCase()) notFound();
  try { await incrementSupabaseArticleViews(article.id); } catch {}
  const [categoryBySlug, brandBySlug] = await Promise.all([getSupabaseCategoryBySlug(article.categoryId), getSupabaseBrandBySlug(article.brandId)]);
  const category = categoryBySlug || { name: article.categoryId, slug: article.categoryId }; const brand = brandBySlug || { name: article.brandId, slug: article.brandId };
  const { articles: relatedArticles } = await getSupabaseArticles({ status: 'published', categorySlug: category.slug, language: lang });
  const filteredRelated = relatedArticles.filter(a => a.id !== article.id).slice(0, 4);
  let jsonLdScript = article.schemaJsonLd;
  if (!jsonLdScript) jsonLdScript = JSON.stringify({ '@context':'https://schema.org','@type':'TechArticle',headline:article.title,description:article.metaDescription,articleBody:`${article.shortDefinition} ${article.meaning} ${article.technicalExplanation}`,inLanguage:langObj.code,mainEntity:{'@type':'FAQPage',mainEntity:(article.faq||[]).map(f=>({'@type':'Question',name:f.question,acceptedAnswer:{'@type':'Answer',text:f.answer}}))} }, null, 2);

  return <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col"><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLdScript}} /><Navbar /><main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
    <Breadcrumbs items={[{label:'Categories',href:`/${lang}`},{label:category.name,href:`/${lang}/category/${category.slug}`},{label:article.errorCode}]} />
    <header className="my-4 pb-4 border-b border-gray-300"><div className="flex flex-wrap items-center gap-2 mb-2"><span className="px-2.5 py-1 bg-gray-900 text-white font-mono font-bold text-xs rounded-xs">CODE: {article.errorCode}</span><span className="px-2 py-0.5 bg-amber-400 text-gray-950 font-bold font-mono text-[11px] rounded-xs">{langObj.flag} {langObj.name}</span><span className="text-xs font-mono text-gray-500">Updated: {new Date(article.updatedAt).toLocaleDateString()}</span>{article.readingTime&&<span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xs">{article.readingTime}</span>}</div><h1 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">{article.title}</h1><p className="mt-3 text-base text-gray-700 leading-relaxed max-w-4xl">{article.shortDefinition}</p></header>
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8"><article className="lg:col-span-3 space-y-8">
      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs rounded-r-xs"><div className="flex items-center gap-2 font-bold"><AlertTriangle className="w-4 h-4" />Diagnostic Notice ({langObj.name})</div><p className="mt-1">Always ensure your hardware is powered off before inspecting physical components or executing command-line instructions.</p></div>
      <section><h2 className="font-serif text-xl font-bold border-b border-gray-200 pb-1.5 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-700" />System Meaning &amp; Subsystem Impact</h2><p className="mt-3 text-sm leading-relaxed">{article.meaning}</p></section>
      {article.causes?.length>0&&<section><h2 className="font-serif text-xl font-bold border-b border-gray-200 pb-1.5 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-blue-700" />Primary Root Causes</h2><ul className="mt-3 space-y-2">{article.causes.map((cause,i)=><li key={i} className="flex gap-2 bg-gray-50 p-2.5 border border-gray-200 rounded-xs"><span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center font-mono text-[10px] shrink-0">{i+1}</span>{cause}</li>)}</ul></section>}
      {article.solutions?.length>0&&<section><h2 className="font-serif text-xl font-bold border-b border-gray-200 pb-1.5 flex items-center gap-2"><Check className="w-5 h-5 text-blue-700" />Step-by-Step Fix Instructions</h2><div className="mt-4 space-y-4">{article.solutions.map((sol,i)=><div key={i} className="border border-gray-300 rounded-xs bg-white p-5 space-y-3"><h3 className="font-serif font-bold flex items-center gap-2"><span className="px-2 py-0.5 bg-blue-700 text-white font-mono text-xs rounded-xs">Option {i+1}</span>{sol.title}</h3><p className="text-xs leading-relaxed">{sol.description}</p>{sol.steps?.length>0&&<ol className="space-y-1.5 text-xs list-decimal list-inside">{sol.steps.map((step,j)=><li key={j}>{step}</li>)}</ol>}{sol.codeSnippet&&<div className="bg-gray-900 text-emerald-400 p-3.5 rounded-xs font-mono text-xs overflow-x-auto"><div className="text-[10px] text-gray-400 border-b border-gray-800 pb-1 mb-2 flex items-center gap-1"><Terminal className="w-3.5 h-3.5" />Terminal / Command Prompt</div><pre className="whitespace-pre-wrap">{sol.codeSnippet}</pre></div>}</div>)}</div></section>}
      {article.technicalExplanation&&<section><h2 className="font-serif text-xl font-bold border-b border-gray-200 pb-1.5 flex items-center gap-2"><Cpu className="w-5 h-5 text-blue-700" />Low-Level Technical Breakdown</h2><div className="mt-3 p-4 bg-gray-900 text-gray-100 rounded-xs font-mono text-xs leading-relaxed">{article.technicalExplanation}</div></section>}
      {article.faq?.length>0&&<section><h2 className="font-serif text-xl font-bold border-b border-gray-200 pb-1.5 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-700" />Frequently Asked Questions ({langObj.name})</h2><div className="mt-3 space-y-3">{article.faq.map((item,i)=><div key={i} className="border border-gray-200 p-4 rounded-xs bg-gray-50"><h3 className="font-bold text-sm"><span className="text-blue-700 font-mono mr-2">Q:</span>{item.question}</h3><p className="text-xs text-gray-700 mt-1 pl-5">{item.answer}</p></div>)}</div></section>}
    </article><aside className="space-y-6"><Infobox article={article} categoryName={category.name} brandName={brand.name} /><div className="border border-blue-200 bg-blue-50/70 p-4 rounded-xs text-xs"><div className="font-bold text-blue-900 flex items-center gap-1.5"><Share2 className="w-4 h-4" />Language / Switch Manual</div><p className="mt-2">Reading this manual in <strong>{langObj.name}</strong> ({langObj.flag}).</p></div>{filteredRelated.length>0&&<div className="border border-gray-300 bg-white p-4 rounded-xs space-y-3"><h3 className="font-serif font-bold text-sm border-b border-gray-200 pb-1.5">Related Error Codes</h3>{filteredRelated.map(rel=><Link key={rel.id} href={`/${lang}/error/${rel.slug}`} className="block p-2 hover:bg-gray-50 border border-gray-100 rounded-xs"><span className="px-1.5 py-0.5 bg-gray-900 text-white font-mono text-[10px] font-bold rounded-xs mr-1.5">{rel.errorCode}</span><span className="text-xs font-medium">{rel.title}</span></Link>)}</div>}</aside></div>
  </main><Footer /></div>;
}

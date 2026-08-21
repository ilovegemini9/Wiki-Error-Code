import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Infobox } from '@/components/Infobox';
import { getLanguageByCode, SUPPORTED_LANGUAGES } from '@/lib/languages';
import { Check, HelpCircle, AlertTriangle, Terminal, ShieldAlert, Cpu, Share2 } from 'lucide-react';

interface LangErrorPageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LangErrorPageProps) {
  const { lang, slug } = await params;
  const langObj = getLanguageByCode(lang);
  const article = db.getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Error Code Not Found - ErrorCodeWiki',
      description: 'The requested error code manual does not exist in our database.'
    };
  }

  const settings = db.getSettings();
  const siteUrl = settings.siteUrl || 'https://errorcodewiki.org';
  const canonical = article.canonicalUrl || `${siteUrl}/${lang}/error/${article.slug}`;

  // Generate hreflang alternates for all supported languages
  const languageAlternates: Record<string, string> = {
    'x-default': `${siteUrl}/error/${article.slug}`
  };
  SUPPORTED_LANGUAGES.forEach(l => {
    languageAlternates[l.code] = l.code === 'en' ? `${siteUrl}/error/${article.slug}` : `${siteUrl}/${l.code}/error/${article.slug}`;
  });

  return {
    title: article.metaTitle || `${article.title} - ${langObj.name}`,
    description: article.metaDescription || article.shortDefinition,
    alternates: {
      canonical: canonical,
      languages: languageAlternates
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.shortDefinition,
      url: canonical,
      type: 'article',
      siteName: settings.siteName || 'ErrorCodeWiki',
      publishedTime: article.createdAt,
      modifiedTime: article.updatedAt,
      tags: article.tags
    }
  };
}

export default async function LangErrorArticlePage({ params }: LangErrorPageProps) {
  const { lang, slug } = await params;
  const langObj = getLanguageByCode(lang);

  if (!SUPPORTED_LANGUAGES.some(l => l.code === lang.toLowerCase())) {
    notFound();
  }

  const article = db.getArticleBySlug(slug);
  if (!article || (article.language && article.language.toLowerCase() !== lang.toLowerCase())) {
    notFound();
  }

  // Increment view count
  try {
    db.incrementArticleViews(article.id);
  } catch {
    // Ignore increment error during rendering
  }

  const category = db.getCategoryBySlug(article.categoryId) || { name: article.categoryId, slug: article.categoryId };
  const brand = db.getBrandBySlug(article.brandId) || { name: article.brandId, slug: article.brandId };

  // Fetch related error codes
  const { articles: relatedArticles } = db.getArticles({
    status: 'published',
    categorySlug: category.slug,
    language: lang,
    limit: 6
  });

  const filteredRelated = relatedArticles.filter(a => a.id !== article.id).slice(0, 4);

  // Parse or Fallback JSON-LD
  let jsonLdScript = article.schemaJsonLd;
  if (!jsonLdScript) {
    const settings = db.getSettings();
    const siteUrl = settings.siteUrl || 'https://errorcodewiki.org';
    const schemaObj = {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      "headline": article.title,
      "description": article.metaDescription,
      "articleBody": `${article.shortDefinition} ${article.meaning} ${article.technicalExplanation}`,
      "inLanguage": langObj.code,
      "mainEntity": {
        "@type": "FAQPage",
        "mainEntity": (article.faq || []).map((f: any) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer
          }
        }))
      }
    };
    jsonLdScript = JSON.stringify(schemaObj, null, 2);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      {/* Schema.org JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
      />

      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        
        <Breadcrumbs items={[
          { label: 'Categories', href: `/${lang}` },
          { label: category.name, href: `/${lang}/category/${category.slug}` },
          { label: `${article.errorCode}` }
        ]} />

        {/* Article Header */}
        <header className="my-4 pb-4 border-b border-gray-300">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-gray-900 text-white font-mono font-bold text-xs rounded-xs">
              CODE: {article.errorCode}
            </span>
            <span className="px-2 py-0.5 bg-amber-400 text-gray-950 font-bold font-mono text-[11px] rounded-xs">
              {langObj.flag} {langObj.name}
            </span>
            <span className="text-xs font-mono text-gray-500" suppressHydrationWarning>
              Updated: {new Date(article.updatedAt).toLocaleDateString()}
            </span>
            {article.readingTime && (
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-xs">
                {article.readingTime}
              </span>
            )}
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
            {article.title}
          </h1>

          <p className="mt-3 text-base text-gray-700 leading-relaxed font-sans max-w-4xl">
            {article.shortDefinition}
          </p>
        </header>

        {/* Main 2-Column Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Article Body (3 cols) */}
          <article className="lg:col-span-3 space-y-8 font-sans">

            {/* Quick Warning Callout */}
            <div className="p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-900 text-xs rounded-r-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Diagnostic Notice ({langObj.name})</span>
              </div>
              <p className="text-amber-900/90 leading-normal">
                Always ensure your hardware is powered off before inspecting physical components or executing command-line instructions.
              </p>
            </div>

            {/* 1. What It Means */}
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-700" />
                <span>System Meaning & Subsystem Impact</span>
              </h2>
              <div className="prose prose-slate max-w-none text-sm text-gray-800 leading-relaxed">
                <p>{article.meaning}</p>
              </div>
            </section>

            {/* 2. Common Causes */}
            {article.causes && article.causes.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-700" />
                  <span>Primary Root Causes</span>
                </h2>
                <ul className="space-y-2 text-sm text-gray-800">
                  {article.causes.map((cause, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 bg-gray-50 p-2.5 rounded-xs border border-gray-200">
                      <span className="w-5 h-5 bg-gray-900 text-white rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{cause}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 3. Step-by-Step Solutions */}
            {article.solutions && article.solutions.length > 0 && (
              <section className="space-y-5">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <Check className="w-5 h-5 text-blue-700" />
                  <span>Step-by-Step Fix Instructions</span>
                </h2>

                <div className="space-y-4">
                  {article.solutions.map((sol, idx) => (
                    <div key={idx} className="border border-gray-300 rounded-xs bg-white p-5 shadow-2xs space-y-3">
                      <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-700 text-white font-mono text-xs rounded-xs">
                          Option {idx + 1}
                        </span>
                        <span>{sol.title}</span>
                      </h3>

                      {sol.description && (
                        <p className="text-xs text-gray-700 leading-relaxed font-sans">
                          {sol.description}
                        </p>
                      )}

                      {sol.steps && sol.steps.length > 0 && (
                        <ol className="space-y-1.5 text-xs text-gray-800 list-decimal list-inside pl-1 pt-1 font-sans">
                          {sol.steps.map((step, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {sol.codeSnippet && (
                        <div className="mt-3 bg-gray-900 text-emerald-400 p-3.5 rounded-xs font-mono text-xs overflow-x-auto border border-gray-800 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-gray-400 border-b border-gray-800 pb-1 mb-2">
                            <span className="flex items-center gap-1 font-bold">
                              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                              Terminal / Command Prompt
                            </span>
                          </div>
                          <pre className="whitespace-pre-wrap">{sol.codeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 4. Technical Explanation */}
            {article.technicalExplanation && (
              <section className="space-y-3">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-blue-700" />
                  <span>Low-Level Technical Breakdown</span>
                </h2>
                <div className="p-4 bg-gray-900 text-gray-100 rounded-xs font-mono text-xs leading-relaxed border border-gray-800">
                  <p>{article.technicalExplanation}</p>
                </div>
              </section>
            )}

            {/* 5. FAQ */}
            {article.faq && article.faq.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1.5 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-700" />
                  <span>Frequently Asked Questions ({langObj.name})</span>
                </h2>
                <div className="space-y-3">
                  {article.faq.map((item, idx) => (
                    <div key={idx} className="border border-gray-200 p-4 rounded-xs bg-gray-50 space-y-1.5">
                      <h3 className="font-bold text-sm text-gray-900 flex items-start gap-2">
                        <span className="text-blue-700 font-mono">Q:</span>
                        <span>{item.question}</span>
                      </h3>
                      <p className="text-xs text-gray-700 pl-5 leading-relaxed font-sans">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </article>

          {/* Right Sidebar Infobox & Metadata (1 col) */}
          <aside className="space-y-6">
            <Infobox article={article} categoryName={category.name} brandName={brand.name} />

            {/* Language Switcher Notice Card */}
            <div className="border border-blue-200 bg-blue-50/70 p-4 rounded-xs text-xs space-y-2">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-blue-700" />
                <span>Language / Switch Manual</span>
              </div>
              <p className="text-blue-950/90 leading-snug">
                Reading this manual in <strong>{langObj.name}</strong> ({langObj.flag}). You can switch language anytime using the header selector.
              </p>
            </div>

            {/* Related Articles */}
            {filteredRelated.length > 0 && (
              <div className="border border-gray-300 bg-white p-4 rounded-xs space-y-3">
                <h3 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1.5">
                  Related Error Codes
                </h3>
                <div className="space-y-2">
                  {filteredRelated.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/${lang}/error/${rel.slug}`}
                      className="block p-2 hover:bg-gray-50 border border-gray-100 rounded-xs transition-colors group"
                    >
                      <span className="px-1.5 py-0.5 bg-gray-900 text-white font-mono text-[10px] font-bold rounded-xs mr-1.5">
                        {rel.errorCode}
                      </span>
                      <span className="font-medium text-xs text-gray-900 group-hover:text-blue-700 line-clamp-1">
                        {rel.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>

        </div>

      </main>

      <Footer />
    </div>
  );
}

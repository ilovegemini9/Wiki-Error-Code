import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Infobox } from '@/components/Infobox';
import { Check, Copy, HelpCircle, AlertTriangle, Terminal, ShieldAlert, Cpu, Share2 } from 'lucide-react';

interface ErrorPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: ErrorPageProps) {
  const { slug } = await params;
  const article = db.getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Error Code Not Found - ErrorCodeWiki',
      description: 'The requested error code manual does not exist in our database.'
    };
  }

  const settings = db.getSettings();
  const siteUrl = settings.siteUrl || 'https://errorcodewiki.org';
  const canonical = article.canonicalUrl || `${siteUrl}/error/${article.slug}`;

  // Generate hreflang alternates
  const languageAlternates: Record<string, string> = {
    'x-default': `${siteUrl}/error/${article.slug}`,
    'en': `${siteUrl}/error/${article.slug}`,
    'fr': `${siteUrl}/fr/error/${article.slug}`,
    'es': `${siteUrl}/es/error/${article.slug}`,
    'de': `${siteUrl}/de/error/${article.slug}`,
    'ja': `${siteUrl}/ja/error/${article.slug}`
  };

  return {
    title: article.metaTitle || `${article.title} - Step-by-Step Fix`,
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
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.shortDefinition
    }
  };
}

export default async function ErrorArticlePage({ params }: ErrorPageProps) {
  const { slug } = await params;
  const article = db.getArticleBySlug(slug);

  if (!article || (article.language && article.language.toLowerCase() !== 'en')) {
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

  // Fetch related error codes in same category or brand (strictly in same language)
  const { articles: relatedArticles } = db.getArticles({
    status: 'published',
    categorySlug: category.slug,
    language: article.language || 'en',
    limit: 8
  });

  const filteredRelated = relatedArticles.filter(a => a.id !== article.id).slice(0, 4);

  // Parse or Fallback JSON-LD
  let jsonLdScript = article.schemaJsonLd;
  if (!jsonLdScript) {
    try {
      jsonLdScript = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": article.title || '',
        "description": article.metaDescription || '',
        "articleBody": `${article.shortDefinition || ''} ${article.meaning || ''}`,
        "dependencies": brand.name || '',
        "proficiencyLevel": "Expert",
        "mainEntity": {
          "@type": "FAQPage",
          "mainEntity": (article.faq || []).map(f => ({
            "@type": "Question",
            "name": String(f.question || ''),
            "acceptedAnswer": {
              "@type": "Answer",
              "text": String(f.answer || '')
            }
          }))
        }
      }, null, 2);
    } catch {
      jsonLdScript = '{}';
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      {/* JSON-LD Microdata */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript }}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        <Breadcrumbs items={[
          { label: category.name, href: `/category/${category.slug}` },
          { label: `${article.errorCode}` }
        ]} />

        {/* Article Title */}
        <header className="my-4 pb-4 border-b border-gray-300">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-gray-900 text-white rounded-xs">
              {article.errorCode}
            </span>
            <span className="text-xs font-mono text-gray-600">
              {brand.name} • {article.deviceType}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight leading-snug">
            {article.title}
          </h1>

          <div className="mt-2 text-xs text-gray-500 font-mono flex items-center gap-3 flex-wrap">
            <span suppressHydrationWarning>Last Updated: {new Date(article.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>•</span>
            <span>Est. Reading Time: {article.readingTime || '4 min read'}</span>
            <span>•</span>
            <span>{article.viewsCount || 100} views</span>
          </div>
        </header>

        {/* Layout: Main Content + Wikipedia Infobox */}
        <div className="flex flex-col lg:flex-row gap-8 my-6">
          
          {/* Main Content Column */}
          <article className="flex-1 min-w-0 space-y-8 font-sans text-sm leading-relaxed text-gray-800">
            
            {/* Short Definition */}
            <section className="bg-[#f8f9fa] border-l-4 border-blue-700 p-4 font-serif text-base text-gray-900 leading-relaxed rounded-xs">
              <strong>Definition:</strong> {article.shortDefinition}
            </section>

            {/* Meaning Section */}
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-300 pb-1.5 flex items-center gap-2">
                Meaning & Subsystem Impact
              </h2>
              <p className="text-gray-800 leading-relaxed">
                {article.meaning}
              </p>
            </section>

            {/* Causes Section */}
            {article.causes && article.causes.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-300 pb-1.5 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Possible Causes
                </h2>
                <ul className="list-disc list-inside space-y-1.5 text-gray-800 pl-1">
                  {article.causes.map((cause, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {cause}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Step-by-Step Solutions */}
            {article.solutions && article.solutions.length > 0 && (
              <section className="space-y-4">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-300 pb-1.5 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-blue-700" />
                  Step-by-Step Solutions
                </h2>

                <div className="space-y-4">
                  {article.solutions.map((sol, index) => (
                    <div key={index} className="border border-gray-300 bg-white p-4 rounded-xs shadow-2xs space-y-2.5">
                      <h3 className="font-serif font-bold text-base text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gray-900 text-white font-mono font-bold text-xs flex items-center justify-center rounded-xs shrink-0">
                          {index + 1}
                        </span>
                        {sol.title}
                      </h3>
                      <p className="text-xs text-gray-700 leading-relaxed">
                        {sol.description}
                      </p>

                      {sol.steps && sol.steps.length > 0 && (
                        <ol className="list-decimal list-inside space-y-1 text-xs text-gray-800 pl-2 bg-gray-50 p-3 border border-gray-200 rounded-xs">
                          {sol.steps.map((st, stepIdx) => (
                            <li key={stepIdx} className="leading-relaxed">
                              {st}
                            </li>
                          ))}
                        </ol>
                      )}

                      {sol.codeSnippet && (
                        <div className="mt-2 font-mono text-xs bg-gray-900 text-green-400 p-3 rounded-xs overflow-x-auto relative">
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider border-b border-gray-700 pb-1 mb-1.5 flex justify-between items-center">
                            <span>Command Prompt / Terminal</span>
                          </div>
                          <pre className="whitespace-pre-wrap">{sol.codeSnippet}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Technical Explanation */}
            {article.technicalExplanation && (
              <section className="space-y-3">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-300 pb-1.5 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-gray-700" />
                  Technical Explanation
                </h2>
                <div className="p-4 bg-gray-50 border border-gray-300 font-mono text-xs leading-relaxed text-gray-800 rounded-xs">
                  {article.technicalExplanation}
                </div>
              </section>
            )}

            {/* Structured Table - Diagnostic Matrix */}
            <section className="space-y-3">
              <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-300 pb-1.5">
                Diagnostic Summary Matrix
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-left border border-gray-300">
                  <thead className="bg-[#eaecf0] border-b border-gray-300 font-serif font-bold">
                    <tr>
                      <th className="p-2 border.r border-gray-300">Diagnostic Field</th>
                      <th className="p-2">Specification Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="p-2 font-semibold bg-gray-50 border-r border-gray-300 w-44">Error Identifier</td>
                      <td className="p-2 font-mono font-bold text-blue-900">{article.errorCode}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold bg-gray-50 border-r border-gray-300">Target Platform</td>
                      <td className="p-2">{brand.name} ({article.deviceType})</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold bg-gray-50 border-r border-gray-300">Classification</td>
                      <td className="p-2">{category.name} Fault Code</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-semibold bg-gray-50 border-r border-gray-300">Repair Complexity</td>
                      <td className="p-2 text-green-800 font-semibold">Moderate / User Repairable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* FAQ Accordion Section */}
            {article.faq && article.faq.length > 0 && (
              <section className="space-y-3">
                <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-300 pb-1.5 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-700" />
                  Frequently Asked Questions (FAQ)
                </h2>
                <div className="space-y-3">
                  {article.faq.map((item, idx) => (
                    <details key={idx} className="group border border-gray-300 bg-[#f8f9fa] rounded-xs p-3.5 open:bg-white" open={idx === 0}>
                      <summary className="font-serif font-bold text-sm text-gray-900 cursor-pointer list-none flex items-center justify-between">
                        <span>{item.question}</span>
                        <span className="text-gray-500 font-mono text-xs group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <p className="mt-2.5 text-xs text-gray-700 leading-relaxed border-t border-gray-200 pt-2 font-sans">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {/* Related Error Codes */}
            {filteredRelated.length > 0 && (
              <section className="space-y-3 pt-4 border-t border-gray-300">
                <h2 className="font-serif text-lg font-bold text-gray-900">
                  Related {category.name} Error Codes
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredRelated.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/error/${rel.slug}`}
                      className="p-3 border border-gray-300 hover:border-blue-600 bg-white rounded-xs transition-colors group"
                    >
                      <div className="font-mono text-xs font-bold text-blue-900 group-hover:underline">
                        {rel.errorCode}
                      </div>
                      <div className="font-serif text-xs font-bold text-gray-900 mt-0.5 group-hover:text-blue-700 line-clamp-1">
                        {rel.title}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Internal Links Suggestions */}
            {article.internalLinks && article.internalLinks.length > 0 && (
              <section className="p-4 bg-blue-50 border border-blue-200 rounded-xs text-xs space-y-1">
                <span className="font-bold text-blue-900">Recommended Next Steps:</span>
                <div className="flex flex-wrap gap-3 pt-1">
                  {article.internalLinks.map((link, idx) => (
                    <Link key={idx} href={link.url} className="text-blue-700 hover:underline font-medium">
                      → {link.anchorText}
                    </Link>
                  ))}
                </div>
              </section>
            )}

          </article>

          {/* Right Column: Wikipedia Infobox */}
          <Infobox article={article} categoryName={category.name} brandName={brand.name} />

        </div>

      </main>

      <Footer />
    </div>
  );
}

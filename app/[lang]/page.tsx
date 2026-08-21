import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { getLanguageByCode, SUPPORTED_LANGUAGES } from '@/lib/languages';
import { Monitor, Printer, Car, Gamepad2, Code, Database, Smartphone, Terminal, Network, Apple, ArrowRight, ShieldCheck, Clock, BookOpen, Globe } from 'lucide-react';

interface LanguageHomePageProps {
  params: Promise<{
    lang: string;
  }>;
}

const CATEGORY_ICONS: Record<string, any> = {
  windows: Monitor,
  linux: Terminal,
  android: Smartphone,
  iphone: Apple,
  printers: Printer,
  cars: Car,
  gaming: Gamepad2,
  networking: Network,
  programming: Code,
  database: Database,
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LanguageHomePageProps) {
  const { lang } = await params;
  const langObj = getLanguageByCode(lang);
  return {
    title: `ErrorCodeWiki (${langObj.name}) - ${langObj.englishName} Diagnostic Error Code Manual`,
    description: `Search verified error code manuals and diagnostic guides in ${langObj.englishName} (${langObj.name}).`,
  };
}

export default async function LanguageHomePage({ params }: LanguageHomePageProps) {
  const { lang } = await params;
  const langObj = getLanguageByCode(lang);

  if (!SUPPORTED_LANGUAGES.some(l => l.code === lang.toLowerCase())) {
    notFound();
  }

  const categories = db.getCategories();
  
  // Get articles strictly written in this target language
  const { articles: langArticles } = db.getArticles({ status: 'published', language: lang, limit: 12 });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        <Breadcrumbs items={[
          { label: 'Languages', href: '/' },
          { label: `${langObj.flag} ${langObj.name} (${langObj.code.toUpperCase()})` }
        ]} />

        {/* Hero Banner with Language Identity */}
        <section className="my-6 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-xs shadow-xs border border-blue-900">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-gray-950 text-xs font-mono font-bold rounded-xs shadow-2xs">
              <span className="text-base leading-none">{langObj.flag}</span>
              <span>{langObj.name} ({langObj.englishName}) Manual Index</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight leading-snug">
              Manuel de Diagnostic & Codes d&apos;Erreur en {langObj.name}
            </h1>

            <p className="text-sm text-blue-100 leading-relaxed font-sans max-w-2xl mx-auto">
              Recherchez des guides de dépannage et des codes d&apos;erreur vérifiés pour Windows, imprimantes, véhicules (OBD2), consoles et serveurs.
            </p>

            {/* Language Search Form */}
            <form action="/search" method="GET" className="pt-2 max-w-2xl mx-auto">
              <input type="hidden" name="lang" value={lang} />
              <div className="relative flex items-center shadow-xs">
                <input
                  type="text"
                  name="q"
                  placeholder={`Search in ${langObj.name} (e.g. 0x80070005, P0420, E-01)...`}
                  className="w-full bg-white border-2 border-amber-400 text-gray-900 text-base rounded-xs pl-4 pr-28 py-3 font-mono focus:outline-none focus:ring-2 focus:ring-amber-300 transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-bold text-sm rounded-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Rechercher</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Articles List for this Language */}
        <section className="my-8">
          <div className="flex items-center justify-between pb-3 border-b-2 border-gray-900 mb-6">
            <h2 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <span>Diagnostic Manuals in {langObj.name} ({langObj.flag})</span>
            </h2>
            <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-xs">
              {langArticles.length} guides available
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {langArticles.map((art) => (
              <Link
                key={art.id}
                href={`/${lang}/error/${art.slug}`}
                className="group border border-gray-300 p-4 rounded-xs bg-white hover:border-blue-600 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-mono font-bold rounded-xs">
                      {art.errorCode}
                    </span>
                    <span className="text-[10px] font-mono text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded-xs font-bold border border-blue-200">
                      {langObj.flag} {langObj.code.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-base text-gray-900 group-hover:text-blue-700 line-clamp-2 leading-snug">
                    {art.title}
                  </h3>
                  <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                    {art.shortDefinition}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
                  <span>{art.readingTime || '4 min read'}</span>
                  <span className="text-blue-700 font-bold group-hover:underline flex items-center gap-1">
                    Read Fix <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Categories Section */}
        <section className="my-8 pt-4 border-t border-gray-200">
          <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">
            Browse Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.slug] || BookOpen;
              return (
                <Link
                  key={cat.id}
                  href={`/${lang}/category/${cat.slug}`}
                  className="p-3.5 border border-gray-300 rounded-xs bg-gray-50 hover:bg-white hover:border-blue-600 transition-all flex items-center gap-3 group"
                >
                  <div className="p-2 bg-gray-900 text-white rounded-xs shrink-0 group-hover:bg-blue-700 transition-colors">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-gray-900 group-hover:text-blue-700 block leading-tight">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}

import Link from 'next/link';
import { db } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Monitor, Printer, Car, Gamepad2, Code, Database, Smartphone, Terminal, Network, Apple, BookOpen, FolderTree, ArrowRight } from 'lucide-react';

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

export const metadata = {
  title: 'Categories Directory - ErrorCodeWiki',
  description: 'Browse diagnostic error code categories and troubleshooting manuals.',
};

export default function CategoryDirectoryPage() {
  const categories = db.getCategories();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={[
          { label: 'Home', href: '/' },
          { label: 'Categories Directory' }
        ]} />

        {/* Directory Header Banner */}
        <section className="my-6 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xs shadow-xs border border-blue-900">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400 text-gray-950 text-xs font-mono font-bold rounded-xs shadow-2xs">
              <span>Error Code Taxonomy Index</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
              <FolderTree className="w-8 h-8 text-amber-400" />
              <span>Categories Directory</span>
            </h1>

            <p className="text-sm text-blue-100 leading-relaxed font-sans max-w-2xl">
              Browse diagnostic error code guides, system fault solutions, and technical manuals organized by system taxonomy.
            </p>
          </div>
        </section>

        {/* Categories Directory Grid */}
        <section className="my-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const IconComp = CATEGORY_ICONS[cat.slug] || BookOpen;
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group border border-gray-300 p-5 rounded-xs bg-white hover:border-blue-600 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="p-3 bg-gray-900 text-white rounded-xs group-hover:bg-blue-700 transition-colors">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 text-xs font-mono font-bold rounded-xs">
                        {cat.count || 0} manuals
                      </span>
                    </div>

                    <h2 className="font-serif font-bold text-lg text-gray-900 group-hover:text-blue-700 leading-snug">
                      {cat.name}
                    </h2>

                    <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                      {cat.description || `Verified diagnostic manuals and error code troubleshooting steps for ${cat.name}.`}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-blue-700 font-bold group-hover:underline">
                    <span>Browse {cat.name}</span>
                    <ArrowRight className="w-4 h-4" />
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

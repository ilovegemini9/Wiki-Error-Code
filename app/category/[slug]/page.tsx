import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { BookOpen } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = db.getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found - ErrorCodeWiki' };
  return {
    title: `${category.name} Error Codes & Diagnostics - ErrorCodeWiki`,
    description: category.description || `Database of documented error codes, fault messages, and fixes for ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = db.getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { articles, total } = db.getArticles({
    status: 'published',
    categorySlug: slug,
    language: 'en'
  });

  const brands = db.getBrands().filter(b => b.categoryId === category.id);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        
        <Breadcrumbs items={[
          { label: 'Categories', href: '/search' },
          { label: category.name }
        ]} />

        {/* Category Header */}
        <div className="my-4 pb-4 border-b border-gray-300 bg-[#f8f9fa] border p-6 rounded-xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-900 text-white rounded-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-2xl font-bold text-gray-900">
                {category.name} Error Codes Directory
              </h1>
              <p className="text-xs text-gray-600 font-mono mt-0.5">
                {total} Documented Diagnostic Manuals
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed max-w-3xl">
            {category.description}
          </p>

          {brands.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap gap-1.5 items-center">
              <span className="text-xs font-semibold text-gray-700 mr-1">Brands in {category.name}:</span>
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/brand/${b.slug}`}
                  className="px-2.5 py-1 bg-white border border-gray-300 hover:border-blue-600 font-mono text-[11px] text-gray-800 rounded-xs hover:text-blue-700"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Articles List */}
        <div className="my-6 space-y-4">
          <h2 className="font-serif text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
            Articles in {category.name}
          </h2>

          {articles.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 border border-gray-200 text-xs text-gray-600">
              No articles currently listed under {category.name}. Check back soon!
            </div>
          ) : (
            <div className="divide-y divide-gray-200 border border-gray-300 bg-white rounded-xs">
              {articles.map((art) => (
                <article key={art.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-gray-900 text-white rounded-xs">
                          {art.errorCode}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {art.deviceType}
                        </span>
                      </div>
                      <h3 className="font-serif font-bold text-base text-gray-900 hover:text-blue-700">
                        <Link href={`/error/${art.slug}`}>
                          {art.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                        {art.shortDefinition}
                      </p>
                    </div>
                    <Link
                      href={`/error/${art.slug}`}
                      className="shrink-0 px-3 py-1.5 border border-gray-300 text-xs font-medium text-gray-800 hover:bg-gray-100 rounded-xs"
                    >
                      Read Fix
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}

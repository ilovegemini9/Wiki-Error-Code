'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Article, Category, Brand } from '@/lib/types';
import { Save, CheckCircle2, Trash2, Globe, ArrowLeft, Plus, AlertCircle } from 'lucide-react';

export default function ArticleEditorPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params?.id as string;

  const isNew = !articleId || articleId === 'new';

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [form, setForm] = useState<Partial<Article>>({
    errorCode: '',
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    shortDefinition: '',
    meaning: '',
    causes: [''],
    solutions: [{ title: '', description: '', steps: [''] }],
    technicalExplanation: '',
    faq: [{ question: '', answer: '' }],
    schemaJsonLd: '',
    canonicalUrl: '',
    categoryId: 'windows',
    brandId: 'microsoft',
    deviceType: 'PC / System',
    language: 'en',
    keywords: [],
    tags: [],
    featuredImage: '',
    status: 'published',
    readingTime: '3 min read',
    internalLinks: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    fetch('/api/admin/brands').then(r => r.json()).then(d => setBrands(d.brands || []));

    if (!isNew) {
      fetch(`/api/admin/articles?id=${articleId}`)
        .then(r => r.json())
        .then(d => {
          if (d.articles && d.articles.length > 0) {
            const art = d.articles.find((a: Article) => a.id === articleId) || d.articles[0];
            setForm(art);
          }
        });
    }
  }, [articleId, isNew]);

  const handleSave = async (statusOverride?: 'draft' | 'published') => {
    if (!form.errorCode || !form.title) {
      setError('Error code and Title are required.');
      return;
    }

    setError('');
    setLoading(true);

    const payload = {
      ...form,
      status: statusOverride || form.status || 'published'
    };

    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Article saved successfully!');
        router.push('/admin/articles');
      } else {
        const d = await res.json();
        setError(d.error || 'Save failed.');
      }
    } catch {
      setError('Server error while saving.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    if (!confirm('Are you sure you want to delete this article?')) return;

    try {
      const res = await fetch(`/api/admin/articles?id=${form.id}`, { method: 'DELETE' });
      if (res.ok) {
        router.push('/admin/articles');
      }
    } catch {
      alert('Delete failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/admin/articles')}
            className="p-1.5 border border-gray-300 rounded-xs hover:bg-gray-100"
            title="Back to Articles"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-xl font-bold text-gray-900">
              {isNew ? 'Create New Error Code Article' : `Edit Article: ${form.errorCode}`}
            </h1>
            <p className="text-[11px] text-gray-500 font-mono">
              Full rich editor with SEO metadata and schema fields
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && form.slug && (
            <a
              href={`/error/${form.slug}`}
              target="_blank"
              className="px-3 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-800 font-medium rounded-xs flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              Preview
            </a>
          )}
          {!isNew && (
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 font-semibold rounded-xs border border-red-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
          <button
            onClick={() => handleSave('draft')}
            disabled={loading}
            className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white font-semibold rounded-xs flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" />
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={loading}
            className="px-3.5 py-1.5 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-xs flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Publish
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 flex items-center gap-2 rounded-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Editor Form */}
      <div className="space-y-6">
        
        {/* Core Identifiers */}
        <div className="bg-gray-50 border border-gray-300 p-4 rounded-xs space-y-4">
          <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
            Core Metadata & Taxonomy
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Error Code *</label>
              <input
                type="text"
                value={form.errorCode || ''}
                onChange={(e) => setForm({ ...form, errorCode: e.target.value })}
                className="w-full bg-white border border-gray-300 p-2 font-mono rounded-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Category</label>
              <select
                value={form.categoryId || 'windows'}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full bg-white border border-gray-300 p-2 rounded-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Brand</label>
              <select
                value={form.brandId || 'microsoft'}
                onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                className="w-full bg-white border border-gray-300 p-2 rounded-xs"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Article Title *</label>
              <input
                type="text"
                value={form.title || ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-white border border-gray-300 p-2 font-serif font-bold text-sm rounded-xs"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">URL Slug</label>
              <input
                type="text"
                value={form.slug || ''}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full bg-white border border-gray-300 p-2 font-mono text-xs rounded-xs"
                placeholder="e.g. windows-0x80070005"
              />
            </div>
          </div>
        </div>

        {/* SEO Meta Fields */}
        <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-4">
          <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
            Search Engine Optimization (SEO) Fields
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                value={form.metaTitle || ''}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className="w-full border border-gray-300 p-2 font-mono rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Canonical URL</label>
              <input
                type="text"
                value={form.canonicalUrl || ''}
                onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                className="w-full border border-gray-300 p-2 font-mono rounded-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={form.metaDescription || ''}
              onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              className="w-full border border-gray-300 p-2 font-mono rounded-xs"
            />
          </div>
        </div>

        {/* Content Body Sections */}
        <div className="bg-white border border-gray-300 p-4 rounded-xs space-y-4">
          <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
            Article Content Sections
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Short Definition</label>
            <textarea
              rows={2}
              value={form.shortDefinition || ''}
              onChange={(e) => setForm({ ...form, shortDefinition: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Meaning & Technical Overview</label>
            <textarea
              rows={4}
              value={form.meaning || ''}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              className="w-full border border-gray-300 p-2 rounded-xs"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Technical Explanation (Low Level)</label>
            <textarea
              rows={3}
              value={form.technicalExplanation || ''}
              onChange={(e) => setForm({ ...form, technicalExplanation: e.target.value })}
              className="w-full border border-gray-300 p-2 font-mono rounded-xs"
            />
          </div>
        </div>

        {/* Schema JSON-LD */}
        <div className="bg-gray-900 text-white p-4 rounded-xs space-y-2">
          <div className="font-serif font-bold text-xs text-white border-b border-gray-800 pb-1">
            Schema.org JSON-LD Markup
          </div>
          <textarea
            rows={5}
            value={form.schemaJsonLd || ''}
            onChange={(e) => setForm({ ...form, schemaJsonLd: e.target.value })}
            className="w-full bg-gray-950 text-green-400 font-mono text-[11px] p-2 rounded-xs border border-gray-800"
          />
        </div>

      </div>

    </div>
  );
}

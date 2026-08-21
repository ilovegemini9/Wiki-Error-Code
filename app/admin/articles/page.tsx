'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Article } from '@/lib/types';
import {
  FileText,
  Search,
  Plus,
  Sparkles,
  Edit,
  Trash2,
  Globe,
  CheckCircle2,
  FileClock,
  AlertCircle
} from 'lucide-react';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const loadArticles = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('q', search);
      if (statusFilter !== 'all') query.set('status', statusFilter);

      const res = await fetch(`/api/admin/articles?${query.toString()}`);
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    if (statusFilter !== 'all') query.set('status', statusFilter);

    fetch(`/api/admin/articles?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setArticles(data.articles || []);
      })
      .catch(() => {
        if (!ignore) setArticles([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [search, statusFilter]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete article for error code ${code}?`)) return;

    try {
      const res = await fetch(`/api/admin/articles?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadArticles();
      }
    } catch {
      alert('Failed to delete article.');
    }
  };

  const handleToggleStatus = async (article: Article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, status: newStatus })
      });
      if (res.ok) {
        loadArticles();
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900">
            Article Management
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Search, edit, publish, or delete error code entries
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles/new"
            className="px-3.5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            + New Article
          </Link>
          <Link
            href="/admin/generate"
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold rounded-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Generate AI
          </Link>
        </div>
      </div>

      {/* Search & Filters Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50 p-3 border border-gray-200 rounded-xs">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search code or title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 text-xs text-gray-900 rounded-xs pl-8 pr-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xs font-medium ${statusFilter === 'all' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100'}`}
          >
            All Statuses
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3 py-1.5 rounded-xs font-medium flex items-center gap-1 ${statusFilter === 'published' ? 'bg-green-800 text-white' : 'bg-white text-green-800 border border-gray-300 hover:bg-green-50'}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Published
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-xs font-medium flex items-center gap-1 ${statusFilter === 'draft' ? 'bg-amber-800 text-white' : 'bg-white text-amber-800 border border-gray-300 hover:bg-amber-50'}`}
          >
            <FileClock className="w-3.5 h-3.5" />
            Drafts
          </button>
        </div>

      </div>

      {/* Table List */}
      <div className="border border-gray-300 bg-white rounded-xs overflow-x-auto">
        <table className="w-full border-collapse text-xs text-left">
          <thead className="bg-gray-100 border-b border-gray-300 font-serif font-bold text-gray-900">
            <tr>
              <th className="p-3">Error Code</th>
              <th className="p-3">Title</th>
              <th className="p-3">Category</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 font-mono">
                  Loading articles...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500 font-mono">
                  No articles found matching filters.
                </td>
              </tr>
            ) : (
              articles.map((art) => (
                <tr key={art.id} className="hover:bg-gray-50">
                  <td className="p-3 font-mono font-bold text-blue-900">
                    {art.errorCode}
                  </td>
                  <td className="p-3 font-semibold text-gray-900 max-w-xs truncate">
                    {art.title}
                  </td>
                  <td className="p-3 text-gray-600 font-mono text-[11px]">
                    {art.categoryId}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(art)}
                      className={`px-2 py-0.5 rounded-xs font-mono text-[10px] font-bold uppercase transition-colors ${
                        art.status === 'published'
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                          : 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300'
                      }`}
                      title="Click to toggle Draft / Published"
                    >
                      {art.status}
                    </button>
                  </td>
                  <td className="p-3 text-gray-500 font-mono text-[11px]">
                    {new Date(art.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right space-x-1">
                    <a
                      href={`/error/${art.slug}`}
                      target="_blank"
                      className="inline-block p-1 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-xs"
                      title="Preview Page"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                    <Link
                      href={`/admin/articles/${art.id}`}
                      className="inline-block p-1 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-xs"
                      title="Edit Article"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(art.id, art.errorCode)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs"
                      title="Delete Article"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

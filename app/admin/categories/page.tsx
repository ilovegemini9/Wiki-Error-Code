'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/lib/types';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import { FolderTree, Trash2, Edit, Save, Globe } from 'lucide-react';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterLang, setFilterLang] = useState<string>('all');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [categoryLang, setCategoryLang] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const url = filterLang && filterLang !== 'all' ? `/api/admin/categories?lang=${filterLang}` : '/api/admin/categories';
      const res = await fetch(url);
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const url = filterLang && filterLang !== 'all' ? `/api/admin/categories?lang=${filterLang}` : '/api/admin/categories';
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (!ignore) setCategories(data.categories || []);
      })
      .catch(() => {
        if (!ignore) setCategories([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [filterLang]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          name,
          slug,
          description,
          language: categoryLang !== 'all' ? categoryLang : undefined
        })
      });

      if (res.ok) {
        setName('');
        setSlug('');
        setDescription('');
        setCategoryLang('all');
        setEditingId(null);
        loadCategories();
      }
    } catch {
      alert('Failed to save category');
    }
  };

  const handleEdit = (c: Category) => {
    setEditingId(c.id);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setCategoryLang(c.language || 'all');
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete category ${catName}?`)) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadCategories();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-sans">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-gray-700" />
            Category Management (Categories Directory)
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Categories Directory unique for each language (Catégories uniques par langue)
          </p>
        </div>

        {/* Filter Language Selector */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xs border border-gray-300">
          <Globe className="w-4 h-4 text-blue-700" />
          <span className="font-bold text-gray-700">Filter Language:</span>
          <select
            value={filterLang}
            onChange={(e) => setFilterLang(e.target.value)}
            className="bg-white border border-gray-300 text-gray-900 text-xs rounded-xs p-1 font-mono font-bold"
          >
            <option value="all">🌐 All Languages (Toutes)</option>
            {SUPPORTED_LANGUAGES.map(l => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name} ({l.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <form onSubmit={handleSave} className="p-4 bg-gray-50 border border-gray-300 rounded-xs space-y-3">
          <h2 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
            {editingId ? 'Edit Category' : 'Add New Category'}
          </h2>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Target Language (Langue) *</label>
            <select
              value={categoryLang}
              onChange={(e) => setCategoryLang(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 font-mono rounded-xs font-bold text-gray-900"
            >
              <option value="all">🌐 Universal (All Languages)</option>
              {SUPPORTED_LANGUAGES.map(l => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.code.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Category Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingId) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
              }}
              className="w-full bg-white border border-gray-300 p-2 rounded-xs"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Slug *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 font-mono rounded-xs"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-gray-300 p-2 rounded-xs"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xs hover:bg-gray-800 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              {editingId ? 'Update Category' : 'Save Category'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setSlug('');
                  setDescription('');
                  setCategoryLang('all');
                }}
                className="px-3 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-xs"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="lg:col-span-2 border border-gray-300 bg-white rounded-xs overflow-x-auto">
          <table className="w-full border-collapse text-xs text-left">
            <thead className="bg-gray-100 border-b border-gray-300 font-serif font-bold text-gray-900">
              <tr>
                <th className="p-3">Language</th>
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Articles</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((c) => {
                const langObj = c.language ? SUPPORTED_LANGUAGES.find(l => l.code === c.language) : null;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono font-bold">
                      {langObj ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded-xs flex items-center gap-1 w-fit">
                          <span>{langObj.flag}</span>
                          <span>{langObj.code.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 border border-gray-300 rounded-xs">
                          🌐 Universal
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-serif font-bold text-gray-900">{c.name}</td>
                    <td className="p-3 font-mono text-gray-600">{c.slug}</td>
                    <td className="p-3 font-mono text-blue-900 font-bold">{c.count || 0}</td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-xs"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

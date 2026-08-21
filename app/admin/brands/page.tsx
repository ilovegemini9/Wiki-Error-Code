'use client';

import { useState, useEffect } from 'react';
import { Brand } from '@/lib/types';
import { Tag, Plus, Trash2, Edit, Save } from 'lucide-react';

export default function BrandsAdminPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('windows');
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      setBrands(data.brands || []);
    } catch {
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/brands')
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) setBrands(data.brands || []);
      })
      .catch(() => {
        if (!ignore) setBrands([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId || undefined,
          name,
          slug,
          categoryId,
          deviceTypes: ['Hardware System']
        })
      });

      if (res.ok) {
        setName('');
        setSlug('');
        setEditingId(null);
        loadBrands();
      }
    } catch {
      alert('Failed to save brand');
    }
  };

  const handleEdit = (b: Brand) => {
    setEditingId(b.id);
    setName(b.name);
    setSlug(b.slug);
    setCategoryId(b.categoryId || 'windows');
  };

  const handleDelete = async (id: string, bName: string) => {
    if (!confirm(`Delete brand ${bName}?`)) return;

    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: 'DELETE' });
      if (res.ok) loadBrands();
    } catch {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-sans">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Tag className="w-6 h-6 text-gray-700" />
          Brand Management
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          Equipment manufacturers, platforms, and vendors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form */}
        <form onSubmit={handleSave} className="p-4 bg-gray-50 border border-gray-300 rounded-xs space-y-3">
          <h2 className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
            {editingId ? 'Edit Brand' : 'Add New Brand'}
          </h2>

          <div>
            <label className="block font-bold text-gray-800 mb-1">Brand Name *</label>
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

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white font-bold rounded-xs hover:bg-gray-800 flex items-center gap-1"
            >
              <Save className="w-3.5 h-3.5" />
              {editingId ? 'Update Brand' : 'Save Brand'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setName('');
                  setSlug('');
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
                <th className="p-3">Brand Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {brands.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="p-3 font-serif font-bold text-gray-900">{b.name}</td>
                  <td className="p-3 font-mono text-gray-600">{b.slug}</td>
                  <td className="p-3 font-mono text-gray-600">{b.categoryId}</td>
                  <td className="p-3 text-right space-x-1">
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1 text-gray-600 hover:text-blue-700 hover:bg-gray-100 rounded-xs"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.name)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

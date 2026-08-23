'use client';

import { useEffect, useState } from 'react';
import { Save, Megaphone, Monitor, Smartphone } from 'lucide-react';

const placements = [
  { key: 'top', name: 'Top Ad', description: 'Above article content', icon: Monitor },
  { key: 'in-content', name: 'In-content Ad', description: 'Inside article content', icon: Monitor },
  { key: 'sidebar', name: 'Sidebar Ad', description: 'Desktop sidebar', icon: Monitor },
  { key: 'sticky-mobile', name: 'Sticky Mobile Ad', description: 'Bottom sticky placement on mobile', icon: Smartphone },
  { key: 'bottom', name: 'Bottom Ad', description: 'Below article content', icon: Monitor },
];

type Ads = { enabled: boolean; client: string; slots: Record<string, string> };
const empty: Ads = { enabled: false, client: '', slots: { top: '', 'in-content': '', sidebar: '', 'sticky-mobile': '', bottom: '' } };

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ads>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetch('/api/admin/ads', { cache: 'no-store' }).then(r => r.json()).then(d => { if (d.ads) setAds({ ...empty, ...d.ads, slots: { ...empty.slots, ...(d.ads.slots || {}) } }); }).finally(() => setLoading(false)); }, []);

  const save = async () => {
    setSaving(true); setMessage('');
    try { const r = await fetch('/api/admin/ads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(ads) }); const d = await r.json(); if (!r.ok) throw new Error(d.error || 'Save failed'); setAds(d.ads); setMessage('Saved to Supabase successfully.'); }
    catch (e) { setMessage(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="p-6 font-sans"><div className="animate-pulse text-gray-500">Loading Ads settings...</div></main>;
  return <main className="p-6 max-w-5xl mx-auto font-sans text-gray-900">
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6 text-blue-700" /> Ads</h1><p className="text-sm text-gray-500 mt-1">Manage Google AdSense placements. Settings are stored in Supabase.</p></div><button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-700 text-white rounded font-semibold text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}</button></div>
    {message && <p className="mb-4 text-sm text-blue-700">{message}</p>}
    <section className="bg-white border border-gray-200 rounded p-5 mb-5"><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={ads.enabled} onChange={e => setAds({ ...ads, enabled: e.target.checked })} /> Enable advertisements</label><label className="block mt-5 text-sm font-semibold">Google AdSense Publisher ID<input value={ads.client} onChange={e => setAds({ ...ads, client: e.target.value })} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="mt-2 w-full max-w-xl border border-gray-300 rounded px-3 py-2 text-sm font-mono" /></label></section>
    <div className="grid gap-4 md:grid-cols-2">{placements.map(({ key, name, description, icon: Icon }) => <section key={key} className="bg-white border border-gray-200 rounded p-5"><div className="flex gap-3"><Icon className="w-5 h-5 text-blue-700 mt-0.5" /><div><h2 className="font-bold">{name}</h2><p className="text-xs text-gray-500 mt-1">{description}</p></div></div><label className="block text-xs font-semibold text-gray-600 mt-5 mb-1">Ad Slot ID</label><input value={ads.slots[key] || ''} onChange={e => setAds({ ...ads, slots: { ...ads.slots, [key]: e.target.value } })} placeholder="1234567890" className="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono" /></section>)}</div>
  </main>;
}

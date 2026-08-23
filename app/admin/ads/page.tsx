'use client';

import { useEffect, useState } from 'react';
import { Save, Megaphone, Monitor, Smartphone } from 'lucide-react';

const placements = [
  { key: 'top', name: 'Top Ad', description: 'Above article content', icon: Monitor },
  { key: 'in_content', name: 'In-content Ad', description: 'Inside article content', icon: Monitor },
  { key: 'sidebar', name: 'Sidebar Ad', description: 'Desktop sidebar', icon: Monitor },
  { key: 'sticky_mobile', name: 'Sticky Mobile Ad', description: 'Bottom sticky placement on mobile', icon: Smartphone },
  { key: 'bottom', name: 'Bottom Ad', description: 'Below article content', icon: Monitor },
];

export default function AdminAdsPage() {
  const [publisherId, setPublisherId] = useState('');
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [slots, setSlots] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin_ads_config');
      if (raw) {
        const data = JSON.parse(raw);
        setPublisherId(data.publisherId || '');
        setEnabled(data.enabled || {});
        setSlots(data.slots || {});
      }
    } catch {}
  }, []);

  const save = () => {
    setSaving(true);
    localStorage.setItem('admin_ads_config', JSON.stringify({ publisherId, enabled, slots }));
    setMessage('Saved locally. Connect these values to your AdSense/Supabase settings before production use.');
    setTimeout(() => { setSaving(false); setMessage(''); }, 2500);
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Megaphone className="w-6 h-6 text-blue-700" /> Ads</h1><p className="text-sm text-gray-500 mt-1">Manage Google AdSense placements for desktop and mobile.</p></div>
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-700 text-white rounded font-semibold text-sm flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save'}</button>
      </div>
      <section className="bg-white border border-gray-200 rounded p-5 mb-5">
        <label className="block text-sm font-semibold text-gray-800 mb-2">Google AdSense Publisher ID</label>
        <input value={publisherId} onChange={e => setPublisherId(e.target.value)} placeholder="ca-pub-XXXXXXXXXXXXXXXX" className="w-full max-w-xl border border-gray-300 rounded px-3 py-2 text-sm" />
      </section>
      <div className="grid gap-4 md:grid-cols-2">
        {placements.map(({ key, name, description, icon: Icon }) => (
          <section key={key} className="bg-white border border-gray-200 rounded p-5">
            <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><Icon className="w-5 h-5 text-blue-700 mt-0.5" /><div><h2 className="font-bold text-gray-900">{name}</h2><p className="text-xs text-gray-500 mt-1">{description}</p></div></div><button type="button" onClick={() => setEnabled(v => ({ ...v, [key]: !v[key] }))} className={`relative w-10 h-5 rounded-full ${enabled[key] ? 'bg-blue-700' : 'bg-gray-300'}`} aria-label={`Toggle ${name}`}><span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled[key] ? 'left-5' : 'left-0.5'}`} /></button></div>
            <label className="block text-xs font-semibold text-gray-600 mt-5 mb-1">Ad Slot ID</label>
            <input value={slots[key] || ''} onChange={e => setSlots(v => ({ ...v, [key]: e.target.value }))} placeholder="1234567890" className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
          </section>
        ))}
      </div>
      {message && <p className="mt-4 text-sm text-blue-700">{message}</p>}
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Settings } from '@/lib/types';
import { Settings as SettingsIcon, Save, Globe, Search, Check, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

const DEFAULT_SETTINGS: Settings = {
  siteName: 'ErrorCodeWiki',
  siteUrl: 'https://errorcodewiki.org',
  openRouterApiKey: '',
  defaultAiModel: 'auto_cascade',
  language: 'en',
  googleAnalyticsId: '',
  googleSearchConsoleTag: '',
  adsTxtContent: '',
  robotsTxtContent: '',
  defaultLanguage: 'en',
  sitemapSettings: { autoUpdate: true, includeImages: true },
};

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load settings');
        if (!ignore && data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings, openRouterApiKey: '' });
      })
      .catch((e) => { if (!ignore) setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to load settings' }); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { openRouterApiKey: _ignored, ...safeSettings } = settings;
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeSettings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      setSettings({ ...DEFAULT_SETTINGS, ...data.settings, openRouterApiKey: '' });
      setMessage({ type: 'success', text: 'Global settings saved successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-xs font-mono text-gray-500">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-5xl text-xs font-sans">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2"><SettingsIcon className="w-6 h-6 text-gray-700" />Global Wiki Settings</h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">Configure site identity, SEO feeds, automation and AI strategy.</p>
      </div>

      {message && <div className={`p-3 rounded-xs border flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 border-green-300 text-green-800' : 'bg-red-50 border-red-300 text-red-800'}`}><AlertCircle className="w-4 h-4" />{message.text}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xs space-y-2">
          <div className="font-serif font-bold text-sm flex items-center gap-2 text-emerald-950"><ShieldCheck className="w-4 h-4" />Provider secrets are server-only</div>
          <p className="text-gray-700 leading-relaxed">The OpenRouter API key is intentionally not stored in Supabase, rendered in this page, or written to browser storage. Set <code className="font-mono">OPENROUTER_API_KEY</code> in Vercel Environment Variables. Admin authentication uses <code className="font-mono">ADMIN_USERNAME</code>, <code className="font-mono">ADMIN_PASSWORD</code>, and <code className="font-mono">ADMIN_SESSION_SECRET</code>.</p>
        </section>

        <section className="p-4 bg-white border border-gray-300 rounded-xs space-y-4">
          <h2 className="font-serif font-bold text-sm flex items-center gap-2"><Globe className="w-4 h-4" />Website Identity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-1"><span className="font-bold">Site Name</span><input value={settings.siteName} onChange={(e) => update('siteName', e.target.value)} className="w-full border border-gray-300 p-2 rounded-xs" /></label>
            <label className="space-y-1"><span className="font-bold">Canonical Site URL</span><input value={settings.siteUrl} onChange={(e) => update('siteUrl', e.target.value)} className="w-full border border-gray-300 p-2 font-mono rounded-xs" /></label>
            <label className="space-y-1"><span className="font-bold">Default Language</span><input value={settings.defaultLanguage || ''} onChange={(e) => update('defaultLanguage', e.target.value)} className="w-full border border-gray-300 p-2 rounded-xs" /></label>
          </div>
        </section>

        <section className="p-4 bg-gray-50 border border-gray-300 rounded-xs space-y-4">
          <h2 className="font-serif font-bold text-sm flex items-center gap-2"><Sparkles className="w-4 h-4" />AI Strategy</h2>
          <label className="space-y-1 block"><span className="font-bold">Default AI Model Strategy</span><select value={settings.defaultAiModel || 'auto_cascade'} onChange={(e) => update('defaultAiModel', e.target.value)} className="w-full border border-gray-300 p-2 font-mono rounded-xs"><option value="auto_cascade">Cascade Auto</option><option value="nvidia/nemotron-3-ultra:free">NVIDIA Nemotron</option><option value="poolside/laguna-s-2.1:free">Poolside Laguna</option><option value="nvidia/nemotron-3.5-lightning:free">NVIDIA Nemotron Lightning</option><option value="gemini-3.6-flash">Gemini Fallback</option></select></label>
          <p className="text-[10px] text-gray-500">Model availability and provider billing are controlled by the configured server-side provider credentials.</p>
        </section>

        <section className="p-4 bg-white border border-gray-300 rounded-xs space-y-4">
          <h2 className="font-serif font-bold text-sm flex items-center gap-2"><Search className="w-4 h-4" />Search &amp; Tracking</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1"><span className="font-bold">Google Analytics ID</span><input value={settings.googleAnalyticsId || ''} onChange={(e) => update('googleAnalyticsId', e.target.value)} className="w-full border border-gray-300 p-2 font-mono rounded-xs" /></label>
            <label className="space-y-1"><span className="font-bold">Google Search Console Tag</span><input value={settings.googleSearchConsoleTag || ''} onChange={(e) => update('googleSearchConsoleTag', e.target.value)} className="w-full border border-gray-300 p-2 font-mono rounded-xs" /></label>
          </div>
        </section>

        <section className="p-4 bg-white border border-gray-300 rounded-xs space-y-4">
          <h2 className="font-serif font-bold text-sm">Crawler Files</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1"><span className="font-bold">ads.txt Content</span><textarea rows={6} value={settings.adsTxtContent || ''} onChange={(e) => update('adsTxtContent', e.target.value)} className="w-full border border-gray-300 p-2 font-mono text-[11px] rounded-xs" /></label>
            <label className="space-y-1"><span className="font-bold">robots.txt Directives</span><textarea rows={6} value={settings.robotsTxtContent || ''} onChange={(e) => update('robotsTxtContent', e.target.value)} className="w-full border border-gray-300 p-2 font-mono text-[11px] rounded-xs" /></label>
          </div>
        </section>

        <section className="p-4 bg-white border border-gray-300 rounded-xs space-y-4">
          <h2 className="font-serif font-bold text-sm">Automation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="space-y-1 flex flex-col"><span className="font-bold">Active</span><select value={settings.automationActive ? 'true' : 'false'} onChange={(e) => update('automationActive', e.target.value === 'true')} className="border border-gray-300 p-2 rounded-xs"><option value="false">Disabled</option><option value="true">Enabled</option></select></label>
            <label className="space-y-1"><span className="font-bold">Interval (minutes)</span><input type="number" min={1} value={settings.automationIntervalMinutes ?? 60} onChange={(e) => update('automationIntervalMinutes', Number(e.target.value))} className="w-full border border-gray-300 p-2 rounded-xs" /></label>
            <label className="space-y-1"><span className="font-bold">Publish Status</span><select value={settings.automationPublishStatus || 'published'} onChange={(e) => update('automationPublishStatus', e.target.value as 'published' | 'draft')} className="w-full border border-gray-300 p-2 rounded-xs"><option value="published">Published</option><option value="draft">Draft</option></select></label>
          </div>
        </section>

        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xs flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}

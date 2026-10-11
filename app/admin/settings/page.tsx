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
  const [hasOpenRouterApiKey, setHasOpenRouterApiKey] = useState<boolean | null>(null);
  const [openRouterKeySource, setOpenRouterKeySource] = useState<'database' | 'environment' | 'none' | null>(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState('');
  const [savingProviderKey, setSavingProviderKey] = useState(false);
  const [connectionResult, setConnectionResult] = useState<{ success: boolean; text: string } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let ignore = false;
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load settings');
        if (!ignore && data.settings) setSettings({ ...DEFAULT_SETTINGS, ...data.settings, openRouterApiKey: '' });
        if (!ignore) setHasOpenRouterApiKey(Boolean(data.providerStatus?.hasOpenRouterApiKey));
        if (!ignore) setOpenRouterKeySource(data.providerStatus?.openRouterKeySource || null);
      })
      .catch((e) => { if (!ignore) setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Failed to load settings' }); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((current) => ({ ...current, [key]: value }));

  const saveProviderKey = async () => {
    if (!openRouterKeyInput.trim()) {
      setMessage({ type: 'error', text: 'Paste your OpenRouter API key first.' });
      return;
    }
    setSavingProviderKey(true);
    setMessage(null);
    setConnectionResult(null);
    try {
      const res = await fetch('/api/admin/provider-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: openRouterKeyInput.trim() }),
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Could not validate and save the key.');
      setOpenRouterKeyInput('');
      setHasOpenRouterApiKey(true);
      setMessage({ type: 'success', text: data.message || 'OpenRouter key saved securely.' });
      await testOpenRouterConnection();
    } catch (e) {
      setMessage({ type: 'error', text: e instanceof Error ? e.message : 'Could not save the OpenRouter key.' });
    } finally {
      setSavingProviderKey(false);
    }
  };

  const testOpenRouterConnection = async () => {
    setTestingConnection(true);
    setConnectionResult(null);
    try {
      const res = await fetch('/api/admin/ai-connection-test', { method: 'POST', cache: 'no-store' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setConnectionResult({ success: false, text: data.error || 'OpenRouter connection test failed.' });
        return;
      }
      setConnectionResult({ success: true, text: `${data.message} Model: ${data.model}.` });
    } catch {
      setConnectionResult({ success: false, text: 'Could not run the test. Check your connection and try again.' });
    } finally {
      setTestingConnection(false);
    }
  };

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
        <section className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xs space-y-3">
          <div className="font-serif font-bold text-sm flex items-center gap-2 text-emerald-950"><ShieldCheck className="w-4 h-4" />OpenRouter API connection</div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold ${hasOpenRouterApiKey ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
              <span className={`h-2 w-2 rounded-full ${hasOpenRouterApiKey ? 'bg-green-600' : 'bg-amber-600'}`} />
              {hasOpenRouterApiKey === null ? 'Checking configuration…' : hasOpenRouterApiKey ? 'API key configured securely' : 'API key not configured'}
            </span>
          </div>
          <label className="block space-y-1">
            <span className="font-bold text-gray-900">OpenRouter API Key</span>
            <input type="password" autoComplete="new-password" value={openRouterKeyInput} onChange={(e) => setOpenRouterKeyInput(e.target.value)} placeholder={hasOpenRouterApiKey ? 'Paste a new key to replace the saved key' : 'Paste your sk-or-v1-… key here'} className="w-full border border-emerald-300 bg-white p-3 font-mono rounded-xs" />
            {hasOpenRouterApiKey && (
              <span role="status" className="mt-2 inline-flex items-center gap-2 rounded-xs border border-emerald-300 bg-white px-3 py-2 font-mono font-bold tracking-widest text-emerald-900">
                <ShieldCheck className="h-4 w-4" /> •••••••••••• <span className="font-sans tracking-normal font-medium">Saved API key</span>
              </span>
            )}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={saveProviderKey} disabled={savingProviderKey || !openRouterKeyInput.trim()} className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-bold rounded-xs disabled:opacity-50">
              {savingProviderKey ? 'Validating & saving…' : 'Save & Test API Key'}
            </button>
            <button type="button" onClick={testOpenRouterConnection} disabled={testingConnection || !hasOpenRouterApiKey} className="px-4 py-2 border border-emerald-900 text-emerald-950 font-bold rounded-xs disabled:opacity-50">
              {testingConnection ? 'Testing OpenRouter…' : 'Test Saved Key'}
            </button>
            {connectionResult && <span role="status" className={connectionResult.success ? 'text-green-800 font-bold' : 'text-red-700 font-bold'}>{connectionResult.text}</span>}
          </div>
          <p className="text-gray-700 leading-relaxed">The key is validated with OpenRouter before saving, encrypted on the server, and never returned to this page or stored in browser storage. Keep it private. This test checks provider access; generation can still be affected by model availability, rate limits, and account credits. For server-side encryption, <code className="font-mono">ADMIN_SESSION_SECRET</code> must be configured.</p>
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
          <label className="space-y-1 block"><span className="font-bold">Default AI Model Strategy</span><select value={settings.defaultAiModel || 'auto_cascade'} onChange={(e) => update('defaultAiModel', e.target.value)} className="w-full border border-gray-300 p-2 font-mono rounded-xs"><option value="auto_cascade">Auto Cascade (recommended)</option><option value="google/gemma-4-31b-it:free">Google Gemma 4 31B</option><option value="nvidia/nemotron-3-ultra-550b-a55b:free">NVIDIA Nemotron 3 Ultra</option><option value="google/gemma-4-26b-a4b-it:free">Google Gemma 4 26B</option><option value="cohere/north-mini-code:free">Cohere North Mini Code</option><option value="thinkingmachines/inkling-small:free">Thinking Machines Inkling Small (experimental)</option><option value="thinkingmachines/inkling:free">Thinking Machines Inkling (experimental)</option><option value="gemini-3.6-flash">Gemini Fallback (requires GEMINI_API_KEY)</option></select></label>
          <p className="text-[10px] text-gray-500">Auto Cascade tries the selected model first (if one is selected), then free OpenRouter fallbacks, and finally Gemini when GEMINI_API_KEY is configured. Free endpoints can be rate-limited; Inkling endpoints are experimental and may reject standard chat-completion requests.</p>
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
            <label className="space-y-1"><span className="font-bold">Délai de Génération (Interval, minutes)</span><input type="number" min={30} step={30} value={settings.automationIntervalMinutes ?? 30} onChange={(e) => update('automationIntervalMinutes', Math.max(30, Number(e.target.value)))} className="w-full border border-gray-300 p-2 rounded-xs" /></label>
            <label className="space-y-1"><span className="font-bold">Publish Status</span><select value={settings.automationPublishStatus || 'published'} onChange={(e) => update('automationPublishStatus', e.target.value as 'published' | 'draft')} className="w-full border border-gray-300 p-2 rounded-xs"><option value="published">Published</option><option value="draft">Draft</option></select></label>
          </div>
        </section>

        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xs flex items-center gap-2 disabled:opacity-50"><Save className="w-4 h-4" />{saving ? 'Saving...' : 'Save Settings'}</button>
      </form>
    </div>
  );
}

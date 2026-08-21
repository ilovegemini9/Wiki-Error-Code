'use client';

import { useState, useEffect } from 'react';
import { Settings } from '@/lib/types';
import { Settings as SettingsIcon, Save, Key, Globe, Search, Shield, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Settings>({
    siteName: 'ErrorCodeWiki',
    siteUrl: 'https://errorcodewiki.org',
    openRouterApiKey: '',
    defaultAiModel: 'google/gemma-4-31b-it',
    language: 'English',
    googleAnalyticsId: '',
    googleSearchConsoleTag: '',
    adsTxtContent: '',
    robotsTxtContent: '',
    defaultLanguage: 'English'
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        if (d.settings) {
          setSettings(d.settings);
          if (d.settings.openRouterApiKey) {
            try {
              localStorage.setItem('errorcodewiki_settings_backup_v1', JSON.stringify(d.settings));
            } catch {}
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (res.ok) {
        try {
          localStorage.setItem('errorcodewiki_settings_backup_v1', JSON.stringify(settings));
        } catch {}
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      alert('Failed to save settings');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-xs font-sans">
      
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-gray-700" />
          Global Wiki Settings & Credentials
        </h1>
        <p className="text-xs text-gray-500 font-mono mt-0.5">
          Configure API keys, AI model preferences, and search engine parameters
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-green-50 border border-green-300 text-green-800 rounded-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600" />
          <span>Global settings successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* OpenRouter & AI Config */}
        <div className="p-4 bg-gray-50 border border-gray-300 rounded-xs space-y-3">
          <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
            <Key className="w-4 h-4 text-blue-700" />
            AI Provider Credentials (OpenRouter / Gemini)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">OpenRouter API Key</label>
              <input
                type="password"
                placeholder="sk-or-v1-..."
                value={settings.openRouterApiKey || ''}
                onChange={(e) => setSettings({ ...settings, openRouterApiKey: e.target.value })}
                className="w-full bg-white border border-gray-300 p-2 font-mono rounded-xs"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                If provided, OpenRouter models will be queried through the cascade first. Ultimate Fallback: Google Gemini Server SDK.
              </p>
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Default AI Model Strategy</label>
              <select
                value={settings.defaultAiModel || 'auto_cascade'}
                onChange={(e) => setSettings({ ...settings, defaultAiModel: e.target.value })}
                className="w-full bg-white border border-gray-300 p-2 font-mono text-xs rounded-xs"
              >
                <option value="auto_cascade">⚡ [RECOMMANDÉ] Cascade Auto (Top 3 Meilleurs Modèles Gratuits)</option>
                <option value="nvidia/nemotron-3-ultra:free">★ #1 NVIDIA: Nemotron 3 Ultra (free) - 550B (1M context)</option>
                <option value="poolside/laguna-s-2.1:free">★ #2 Poolside: Laguna S 2.1 (free) - 118B (262K context)</option>
                <option value="nvidia/nemotron-3.5-lightning:free">★ #3 NVIDIA: Nemotron 3.5 Lightning (free) - 30B (1M context)</option>
                <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Secours)</option>
              </select>
              <p className="text-[10px] text-gray-500 mt-1">
                En mode Cascade Auto, si le modèle 1 s&apos;interrompt ou sature, le modèle 2 prend le relais instantanément.
              </p>
            </div>
          </div>

          {/* Cascade Visual Architecture Card */}
          <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xs text-xs space-y-2">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Architecture de Relais Automatique (3 Meilleurs Modèles Gratuits + Secours) :</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="bg-white p-2 border border-emerald-200 rounded-xs shadow-2xs">
                <div className="text-emerald-800 font-bold">1️⃣ Modèle Principal</div>
                <div className="text-gray-900 font-semibold truncate">NVIDIA Nemotron 3 Ultra</div>
                <div className="text-[10px] text-gray-500">550B MoE • 1M context • 4T tokens</div>
              </div>
              <div className="bg-white p-2 border border-emerald-200 rounded-xs shadow-2xs">
                <div className="text-emerald-800 font-bold">2️⃣ Relais Code/Diag (si #1 suspendu)</div>
                <div className="text-gray-900 font-semibold truncate">Poolside Laguna S 2.1</div>
                <div className="text-[10px] text-gray-500">118B • 262K context • 1.77T tokens</div>
              </div>
              <div className="bg-white p-2 border border-emerald-200 rounded-xs shadow-2xs">
                <div className="text-emerald-800 font-bold">3️⃣ Relais Ultra-Rapide (si #2 suspendu)</div>
                <div className="text-gray-900 font-semibold truncate">NVIDIA Nemotron 3.5 Lightning</div>
                <div className="text-[10px] text-gray-500">30B MoE • 1M context • 901B tokens</div>
              </div>
            </div>
            <div className="text-[11px] text-emerald-900 font-sans">
              🛡️ <strong>Garantie Zéro Interruption</strong> : Si tous les modèles OpenRouter gratuits sont indisponibles, le serveur bascule automatiquement et de manière transparente sur <code>gemini-3.6-flash</code> via le SDK Google natif.
            </div>
          </div>
        </div>

        {/* Site Details */}
        <div className="p-4 bg-white border border-gray-300 rounded-xs space-y-3">
          <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-gray-700" />
            Website Identity
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-800 mb-1">Site Name</label>
              <input
                type="text"
                value={settings.siteName || ''}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Canonical Site URL</label>
              <input
                type="text"
                value={settings.siteUrl || ''}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                className="w-full border border-gray-300 p-2 font-mono rounded-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-800 mb-1">Default Language</label>
              <input
                type="text"
                value={settings.defaultLanguage || 'English'}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full border border-gray-300 p-2 rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* Search Console & Analytics */}
        <div className="p-4 bg-white border border-gray-300 rounded-xs space-y-3">
          <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-gray-700" />
            Search Engine Verification & Tracking
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">Google Analytics ID</label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={settings.googleAnalyticsId || ''}
                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                className="w-full border border-gray-300 p-2 font-mono rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Google Search Console Tag</label>
              <input
                type="text"
                placeholder="google-site-verification=..."
                value={settings.googleSearchConsoleTag || ''}
                onChange={(e) => setSettings({ ...settings, googleSearchConsoleTag: e.target.value })}
                className="w-full border border-gray-300 p-2 font-mono rounded-xs"
              />
            </div>
          </div>
        </div>

        {/* Custom File Directives (ads.txt, robots.txt) */}
        <div className="p-4 bg-white border border-gray-300 rounded-xs space-y-3">
          <div className="font-serif font-bold text-sm text-gray-900 border-b border-gray-200 pb-1">
            Custom Crawler Files
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ads.txt Content</label>
              <textarea
                rows={4}
                value={settings.adsTxtContent || ''}
                onChange={(e) => setSettings({ ...settings, adsTxtContent: e.target.value })}
                placeholder="google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0"
                className="w-full border border-gray-300 p-2 font-mono text-[11px] rounded-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">robots.txt Directives</label>
              <textarea
                rows={4}
                value={settings.robotsTxtContent || ''}
                onChange={(e) => setSettings({ ...settings, robotsTxtContent: e.target.value })}
                placeholder="User-agent: * &#10;Allow: /"
                className="w-full border border-gray-300 p-2 font-mono text-[11px] rounded-xs"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xs flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Global Settings
        </button>

      </form>

    </div>
  );
}

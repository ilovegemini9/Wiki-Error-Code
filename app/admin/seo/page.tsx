'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  Rss,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
  Layers,
  FileText,
  Clock,
  ExternalLink,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface PingResult {
  name: string;
  path: string;
  fullUrl: string;
  status: number;
  statusText: string;
  ok: boolean;
  responseTimeMs: number;
  contentType: string;
  sizeBytes: number;
  itemCount: number;
  details: Record<string, any>;
  lastChecked: string;
}

interface MonitorData {
  timestamp: string;
  summary: {
    totalEndpoints: number;
    healthyEndpoints: number;
    allHealthy: boolean;
    totalSitemapUrls: number;
    totalRssItems: number;
  };
  results: PingResult[];
}

export default function SeoAdminPage() {
  const [data, setData] = useState<MonitorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPingTime, setLastPingTime] = useState<string>('');

  useEffect(() => {
    let ignore = false;
    async function loadData() {
      try {
        const res = await fetch('/api/admin/ping-feeds');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json: MonitorData = await res.json();
        if (!ignore) {
          setData(json);
          setLastPingTime(new Date().toLocaleTimeString());
        }
      } catch (err: any) {
        if (!ignore) {
          setError(err.message || 'Failed to ping crawler endpoints');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    loadData();
    return () => { ignore = true; };
  }, []);

  const fetchFeedStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ping-feeds');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json: MonitorData = await res.json();
      setData(json);
      setLastPingTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      setError(err.message || 'Failed to ping crawler endpoints');
    } finally {
      setLoading(false);
    }
  };

  const getIconForPath = (path: string) => {
    switch (path) {
      case '/sitemap.xml':
        return <Globe className="w-5 h-5 text-blue-700" />;
      case '/rss.xml':
        return <Rss className="w-5 h-5 text-amber-600" />;
      case '/sitemap-images.xml':
        return <Globe className="w-5 h-5 text-purple-700" />;
      case '/robots.txt':
        return <FileCode className="w-5 h-5 text-gray-700" />;
      default:
        return <FileText className="w-5 h-5 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl text-xs font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Search className="w-6 h-6 text-blue-800" />
            Crawler & Feed Monitor
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Real-time ping verification of /sitemap.xml, /rss.xml, and search engine endpoints
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchFeedStatus}
            disabled={loading}
            className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold rounded-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Pinging...' : 'Ping All Endpoints'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xs flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold">Ping Monitor Alert</div>
            <div className="text-xs">{error}</div>
          </div>
        </div>
      )}

      {/* Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          
          {/* Status KPI */}
          <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Feed Health Status</div>
            <div className="flex items-center gap-2 mt-1">
              {data.summary.allHealthy ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                  </span>
                  <span className="text-xl font-bold text-green-700">200 OK</span>
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  <span className="text-xl font-bold text-red-700">Issue Detected</span>
                </>
              )}
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1">
              {data.summary.healthyEndpoints} / {data.summary.totalEndpoints} endpoints active
            </div>
          </div>

          {/* Sitemap Indexed Items */}
          <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Sitemap URLs Indexed</div>
            <div className="text-2xl font-serif font-bold text-blue-900 mt-1">
              {data.summary.totalSitemapUrls}
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-1">
              <Globe className="w-3 h-3 text-blue-700" /> Dynamic /sitemap.xml
            </div>
          </div>

          {/* RSS Feed Items */}
          <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">RSS Feed Entries</div>
            <div className="text-2xl font-serif font-bold text-amber-800 mt-1">
              {data.summary.totalRssItems}
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-1">
              <Rss className="w-3 h-3 text-amber-600" /> Public RSS 2.0
            </div>
          </div>

          {/* Last Ping Timestamp */}
          <div className="p-3.5 bg-white border border-gray-300 rounded-xs">
            <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Last Diagnostic Ping</div>
            <div className="text-xl font-mono font-bold text-gray-900 mt-1">
              {lastPingTime || 'Just now'}
            </div>
            <div className="text-[10px] text-gray-500 font-mono mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Live HTTP verification
            </div>
          </div>

        </div>
      )}

      {/* Main Endpoint Monitor Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <h2 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-800" />
            Endpoint Ping Diagnostic Results
          </h2>
          <span className="text-[11px] font-mono text-gray-500">
            Click endpoint URL to view raw XML output
          </span>
        </div>

        {loading && !data ? (
          <div className="p-12 text-center bg-gray-50 border border-gray-200 text-gray-600 rounded-xs font-mono">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-800" />
            Pinging crawler endpoints and parsing XML indexes...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data?.results.map((ep) => (
              <div
                key={ep.path}
                className="bg-white border border-gray-300 rounded-xs p-4 flex flex-col justify-between hover:border-gray-400 transition-colors shadow-xs"
              >
                <div>
                  {/* Top bar: name & status pill */}
                  <div className="flex items-start justify-between gap-2 border-b border-gray-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-gray-50 border border-gray-200 rounded-xs">
                        {getIconForPath(ep.path)}
                      </div>
                      <div>
                        <h3 className="font-serif font-bold text-sm text-gray-900">
                          {ep.name}
                        </h3>
                        <a
                          href={ep.path}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[11px] text-blue-700 hover:underline flex items-center gap-1 mt-0.5"
                        >
                          {ep.path}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {ep.ok ? (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-[10px] font-mono font-bold rounded-xs flex items-center gap-1 border border-green-200">
                          <CheckCircle2 className="w-3 h-3 text-green-700" />
                          {ep.status} OK
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-mono font-bold rounded-xs flex items-center gap-1 border border-red-200">
                          <AlertTriangle className="w-3 h-3 text-red-700" />
                          {ep.status} {ep.statusText}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-500">
                        ⚡ {ep.responseTimeMs} ms
                      </span>
                    </div>
                  </div>

                  {/* Body Info: Item Count & Breakdown */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-xs bg-gray-50 p-2.5 rounded-xs border border-gray-200">
                      <span className="font-medium text-gray-700 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-gray-500" />
                        Indexed Items Count:
                      </span>
                      <span className="font-mono font-bold text-sm text-gray-900 bg-white px-2 py-0.5 border border-gray-300 rounded-xs">
                        {ep.itemCount} {ep.path === '/sitemap.xml' ? 'URLs' : ep.path === '/rss.xml' ? 'Items' : 'Records'}
                      </span>
                    </div>

                    {/* Extended Details if available */}
                    {Object.keys(ep.details).length > 0 && (
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
                        {Object.entries(ep.details).map(([k, v]) => (
                          <div key={k} className="p-1.5 bg-gray-50 border border-gray-200 rounded-xs text-center">
                            <span className="text-gray-500 block truncate capitalize">
                              {k.replace(/([A-Z])/g, ' $1')}
                            </span>
                            <span className="font-bold text-gray-800">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="mt-4 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
                  <span>Size: {(ep.sizeBytes / 1024).toFixed(1)} KB</span>
                  <span>Type: {ep.contentType.split(';')[0]}</span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Crawler & SEO Guidelines Box */}
      <div className="p-4 bg-[#f8f9fa] border border-gray-300 rounded-xs space-y-3">
        <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-900" />
          Crawler Accessibility & Search Engine Indexing
        </h3>
        <p className="text-xs text-gray-700 leading-relaxed">
          Googlebot, Bingbot, and LLM web crawlers continuously poll these feed endpoints to discover newly published error diagnostic guides. 
          The monitor pings each endpoint over HTTP, ensuring the response returns <code className="bg-gray-200 px-1 py-0.5 rounded-xs font-mono font-bold">200 OK</code> with valid XML header structures and zero syntax errors.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 font-mono">
          <div className="p-2 bg-white border border-gray-200 rounded-xs flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Fast response (&lt; 100ms)</span>
          </div>
          <div className="p-2 bg-white border border-gray-200 rounded-xs flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-700" />
            <span>Clean Hreflang Tags</span>
          </div>
          <div className="p-2 bg-white border border-gray-200 rounded-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-700" />
            <span>Auto-Updated on Publish</span>
          </div>
        </div>
      </div>

    </div>
  );
}

'use client';

import { useEffect } from 'react';

const LOCAL_STORAGE_ARTICLES_KEY = 'errorcodewiki_articles_backup_v1';
const LOCAL_STORAGE_SETTINGS_KEY = 'errorcodewiki_settings_backup_v1';

export default function AutoSyncProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let isMounted = true;

    async function performAutoSync() {
      try {
        // 1. Fetch current server state
        const res = await fetch('/api/admin/sync');
        if (!res.ok) return;
        const serverData = await res.json();
        if (!serverData.success) return;

        const serverArticles = serverData.articles || [];
        const serverSettings = serverData.settings || {};

        // 2. Read local backup from browser localStorage
        let localArticles: any[] = [];
        let localSettings: any = {};
        try {
          const rawArt = localStorage.getItem(LOCAL_STORAGE_ARTICLES_KEY);
          if (rawArt) localArticles = JSON.parse(rawArt);
        } catch {}

        try {
          const rawSet = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
          if (rawSet) localSettings = JSON.parse(rawSet);
        } catch {}

        // Save server articles to localStorage backup if server has equal or more articles
        if (serverArticles.length >= localArticles.length) {
          localStorage.setItem(LOCAL_STORAGE_ARTICLES_KEY, JSON.stringify(serverArticles));
        }

        if (serverSettings.openRouterApiKey) {
          localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(serverSettings));
        }

        // 3. Check if server needs restoration from local backup
        const missingLocalInServer = localArticles.filter((la: any) => 
          !serverArticles.some((sa: any) => sa.id === la.id || (sa.errorCode.toLowerCase() === la.errorCode.toLowerCase() && (sa.language || 'en') === (la.language || 'en')))
        );

        const hasLocalKeyButServerMissing = localSettings.openRouterApiKey && !serverSettings.openRouterApiKey;

        if (missingLocalInServer.length > 0 || hasLocalKeyButServerMissing) {
          const syncRes = await fetch('/api/admin/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              articles: missingLocalInServer,
              settings: hasLocalKeyButServerMissing ? { openRouterApiKey: localSettings.openRouterApiKey } : {}
            })
          });
          const syncData = await syncRes.json();
          if (syncData.success && isMounted) {
            console.log(`[AutoSync] Restored ${missingLocalInServer.length} articles to server!`);
          }
        }
      } catch (e) {
        console.error('[AutoSync] Sync check failed:', e);
      }
    }

    performAutoSync();

    return () => {
      isMounted = false;
    };
  }, []);

  return <>{children}</>;
}

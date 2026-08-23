'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function detectDevice() {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod/i.test(ua)) return 'mobile';
  return 'desktop';
}

function detectBrowser() {
  const ua = navigator.userAgent;
  if (/edg\//i.test(ua)) return 'Edge';
  if (/chrome\//i.test(ua)) return 'Chrome';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'Safari';
  return 'Other';
}

function detectOS() {
  const ua = navigator.userAgent;
  if (/windows/i.test(ua)) return 'Windows';
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/mac os/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (navigator.doNotTrack === '1') return;

    // Never record admin traffic as public-site analytics.
    // This prevents admin navigation, refreshes, and analytics dashboard visits
    // from inflating public visitors/pageviews/referrers/country statistics.
    if (pathname === '/admin' || pathname?.startsWith('/admin/')) return;

    const key = 'ecw_analytics_session';
    let sessionId = sessionStorage.getItem(key);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem(key, sessionId);
    }

    const landingKey = 'ecw_analytics_landing';
    let landingPath = sessionStorage.getItem(landingKey);
    if (!landingPath) {
      landingPath = `${pathname || '/'}${window.location.search}`;
      sessionStorage.setItem(landingKey, landingPath);
    }

    const payload = {
      sessionId,
      path: `${pathname || '/'}${window.location.search}`,
      landingPath,
      referrer: document.referrer || null,
      utmSource: searchParams.get('utm_source'),
      utmMedium: searchParams.get('utm_medium'),
      utmCampaign: searchParams.get('utm_campaign'),
      deviceType: detectDevice(),
      browser: detectBrowser(),
      os: detectOS(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      pageTitle: document.title,
      metadata: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
    };

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2500);
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
      signal: controller.signal,
    }).catch(() => {}).finally(() => window.clearTimeout(timer));

    return () => window.clearTimeout(timer);
  }, [pathname, searchParams]);

  return null;
}

export default function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsTracker />
    </Suspense>
  );
}

'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';

export default function AdSenseScript() {
  const [client, setClient] = useState('');
  useEffect(() => { fetch('/api/ads/config', { cache: 'no-store' }).then(r => r.json()).then(data => setClient(data?.enabled && data?.client ? data.client : '')).catch(() => setClient('')); }, []);
  if (!client) return null;
  return <Script async strategy="afterInteractive" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`} crossOrigin="anonymous" />;
}

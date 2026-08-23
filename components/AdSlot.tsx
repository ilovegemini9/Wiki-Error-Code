'use client';
import { useEffect, useState } from 'react';

export type AdPlacement = 'top' | 'in-content' | 'sidebar' | 'sticky-mobile' | 'bottom';
type AdsConfig = { enabled: boolean; client: string; slots: Record<AdPlacement, string> };

export default function AdSlot({ placement }: { placement: AdPlacement }) {
  const [config, setConfig] = useState<AdsConfig | null>(null);
  useEffect(() => { fetch('/api/ads/config', { cache: 'no-store' }).then(r => r.json()).then(setConfig).catch(() => setConfig(null)); }, []);
  const client = config?.client || '';
  const slot = config?.slots?.[placement] || '';
  if (!config?.enabled || !client || !slot) return null;
  const sticky = placement === 'sticky-mobile';
  useEffect(() => { try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); } catch {} }, [client, slot]);
  return <div className={`${sticky ? 'fixed bottom-0 left-0 right-0 z-50 md:hidden' : ''} ${placement === 'sidebar' ? 'hidden lg:block' : ''} bg-white/95 backdrop-blur-sm`}><div className="mx-auto max-w-5xl px-2 py-2"><div className="text-[8px] uppercase tracking-widest text-gray-400 text-center mb-1">Advertisement</div><ins className="adsbygoogle block" style={{ display:'block', minHeight: sticky ? '50px' : placement === 'sidebar' ? '250px' : '90px' }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" /></div></div>;
}

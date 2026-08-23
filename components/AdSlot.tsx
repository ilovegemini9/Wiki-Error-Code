'use client';
import { useEffect, useRef } from 'react';

export type AdPlacement = 'top' | 'in-content' | 'sidebar' | 'sticky-mobile' | 'bottom';

const slots: Record<AdPlacement, string | undefined> = {
  top: process.env.NEXT_PUBLIC_AD_SLOT_TOP,
  'in-content': process.env.NEXT_PUBLIC_AD_SLOT_IN_CONTENT,
  sidebar: process.env.NEXT_PUBLIC_AD_SLOT_SIDEBAR,
  'sticky-mobile': process.env.NEXT_PUBLIC_AD_SLOT_STICKY_MOBILE,
  bottom: process.env.NEXT_PUBLIC_AD_SLOT_BOTTOM,
};

export default function AdSlot({ placement }: { placement: AdPlacement }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const slot = slots[placement];
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!client || !slot) return;
    try { ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({}); } catch {}
  }, [client, slot]);
  if (!client || !slot) return null;
  const sticky = placement === 'sticky-mobile';
  return <div className={`${sticky ? 'fixed bottom-0 left-0 right-0 z-50 md:hidden' : ''} ${placement === 'sidebar' ? 'hidden lg:block' : ''} bg-white/95 backdrop-blur-sm`}><div className="mx-auto max-w-5xl px-2 py-2"><div className="text-[8px] uppercase tracking-widest text-gray-400 text-center mb-1">Advertisement</div><ins ref={ref as any} className="adsbygoogle block" style={{ display:'block', minHeight: sticky ? '50px' : placement === 'sidebar' ? '250px' : '90px' }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" /></div></div>;
}

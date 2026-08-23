import type { Metadata, Viewport } from 'next';
import './globals.css';
import AutoSyncProvider from '@/components/AutoSyncProvider';
import AnalyticsProvider from '@/components/AnalyticsProvider';
import AdSenseScript from '@/components/AdSenseScript';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e3a8a',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://errorcodewiki.ai.studio'),
  title: 'ErrorCodeWiki - Error Code Database & Troubleshooting',
  description: 'Searchable database of error codes across software, hardware, vehicles, appliances, and networking equipment.',
  verification: { google: 'WkXRsZNaG77qk0yXebhvc_3VAHqFVP7NsvdVhtFSO5A' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body suppressHydrationWarning className="bg-white text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900"><AnalyticsProvider /><AdSenseScript /><AutoSyncProvider>{children}</AutoSyncProvider></body></html>;
}

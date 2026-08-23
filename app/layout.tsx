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
  verification: { google: ['googlea4a6cf77ebec56e8', 'QRRnb67ZqiKc6NpatA0tb1vzN2aLZTP9XycpFLjjjVg', 'BN0Dx7OuNNse5IW0QIJ_R4omjUvtWiWkJmq86sxUj7Q'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body suppressHydrationWarning className="bg-white text-gray-900 antialiased selection:bg-blue-100 selection:text-blue-900"><AnalyticsProvider /><AdSenseScript /><AutoSyncProvider>{children}</AutoSyncProvider></body></html>;
}

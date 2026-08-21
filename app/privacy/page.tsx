import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { ShieldCheck, Lock, Eye, FileText, Database, Server } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Privacy Policy | ErrorCodeWiki Technical Diagnostic Database',
  description: 'Official Privacy Policy for ErrorCodeWiki. Learn how we handle analytics, cookies, diagnostic logs, and protect your privacy when searching error code manuals.',
  openGraph: {
    title: 'Privacy Policy | ErrorCodeWiki',
    description: 'Privacy Policy and Data Protection standards at ErrorCodeWiki.',
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = 'August 2, 2026';

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

        <article className="prose prose-gray max-w-none space-y-8">
          
          {/* Header */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Legal & Privacy Compliance</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Effective Date: <time dateTime="2026-08-02">{lastUpdated}</time> | Standard Knowledge Base Privacy Protocols
            </p>
          </div>

          {/* Quick Summary Box */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xs text-xs text-blue-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-sm text-blue-950">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>Privacy Overview in Plain English:</span>
            </div>
            <p className="leading-relaxed">
              At <strong>ErrorCodeWiki</strong>, we respect your digital privacy. We do not require account registration to view error code manuals, diagnostic steps, or troubleshooting documentation. We do not sell personal data to third parties. We use standard non-personally identifiable web analytics and ad technologies (such as Google AdSense and Google Analytics) to keep this technical manual free and globally accessible.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <Eye className="w-5 h-5 text-gray-700" />
              1. Information We Collect
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              When you browse ErrorCodeWiki, we collect limited diagnostic and technical usage data to optimize server performance, improve error code search relevancy, and detect malicious scraping bots:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
              <li>
                <strong>Diagnostic Search Queries:</strong> Search terms typed into our error code search bar (e.g., <code>0x80070005</code>, <code>P0420</code>) are aggregated anonymously to identify missing error documentation.
              </li>
              <li>
                <strong>Server Access Logs:</strong> Standard web server request metadata, including your IP address, browser user-agent, operating system, referrer URL, and timestamp.
              </li>
              <li>
                <strong>Cookie Data & Web Beacons:</strong> Standard HTTP cookies stored locally in your browser to remember search filters, dark mode preferences, or admin session state.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <Database className="w-5 h-5 text-gray-700" />
              2. Third-Party Advertising & Cookie Policy (Google AdSense)
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              ErrorCodeWiki is financed through third-party advertising networks, including Google AdSense. Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
              <li>
                Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visit to ErrorCodeWiki and/or other sites on the Internet.
              </li>
              <li>
                Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">Google Ad Settings</a> or <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">aboutads.info</a>.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <Server className="w-5 h-5 text-gray-700" />
              3. Analytics & Crawlers
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              We utilize Google Analytics and AI indexing web crawlers (including GPTBot, ClaudeBot, and PerplexityBot via our <code>robots.txt</code> and <code>llms.txt</code> directives) to index technical documentation for generative AI search engines and search ranking. Analytics data is aggregated and does not contain personally identifiable financial or health information.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-700" />
              4. GDPR & CCPA Data Rights
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Depending on your jurisdiction (e.g., European Union GDPR or California CCPA), you have specific statutory rights regarding your internet data:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
              <li>The right to request disclosure or deletion of any stored browser metadata.</li>
              <li>The right to opt-out of non-essential cookies via your browser preferences or ad-blockers.</li>
              <li>The right to lodge inquiries regarding data handling by contacting our support desk.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="font-serif text-xl font-bold text-gray-900">
              5. Contacting Our Data Privacy Team
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy or wish to report a privacy concern, please submit an inquiry on our <Link href="/contact" className="text-blue-700 font-bold hover:underline">Contact Page</Link> or send an email to <code>privacy@errorcodewiki.ai.studio</code>.
            </p>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}

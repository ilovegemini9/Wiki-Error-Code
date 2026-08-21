import { Metadata } from 'next';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { Scale, AlertTriangle, BookOpen, ShieldCheck, HelpCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terms of Service | ErrorCodeWiki Technical Manual',
  description: 'Terms of Service and legal agreements governing the use of ErrorCodeWiki error code documentation, API feeds, and diagnostic manuals.',
  openGraph: {
    title: 'Terms of Service | ErrorCodeWiki',
    description: 'Terms of Service for accessing ErrorCodeWiki troubleshooting manuals.',
  },
};

export default function TermsOfServicePage() {
  const lastUpdated = 'August 2, 2026';

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <Breadcrumbs items={[{ label: 'Terms of Service' }]} />

        <article className="prose prose-gray max-w-none space-y-8">
          
          {/* Header */}
          <div className="border-b border-gray-300 pb-6">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Scale className="w-4 h-4" />
              <span>Legal Terms & User Rights</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Last Updated: <time dateTime="2026-08-02">{lastUpdated}</time> | Terms Governing Usage of ErrorCodeWiki
            </p>
          </div>

          {/* Intro Box */}
          <div className="bg-gray-100 border border-gray-300 p-4 rounded-xs text-xs text-gray-800 space-y-2">
            <p className="leading-relaxed">
              Welcome to <strong>ErrorCodeWiki</strong> (&ldquo;the Site&rdquo;). By accessing, reading, searching, or citing any technical manual, diagnostic code, repair step, or error code article hosted on ErrorCodeWiki, you agree to comply with and be bound by the following Terms of Service. If you do not agree to these terms, please do not use the Site.
            </p>
          </div>

          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-700" />
              1. Informational & Educational Purpose Only
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              All materials provided on ErrorCodeWiki—including error code definitions, root cause analyses, command-line repair snippets, registry tweaks, printer maintenance procedures, automotive OBD-II diagnostic steps, and appliance error codes—are made available solely for technical education and informational reference.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              2. Technical Safety & User Responsibility
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Working with complex computing software, command-line interfaces, server infrastructure, high-voltage home appliances, firmware flashing, or automotive engine diagnostics carries inherent physical and financial risks:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
              <li>
                You acknowledge that performing diagnostic repairs, modifying operating system files (e.g., Windows Registry, Linux <code>/etc</code> configurations), or resetting vehicle error codes is done entirely at your own risk.
              </li>
              <li>
                ErrorCodeWiki and its administrators shall not be held liable for hardware failure, data loss, vehicle damage, voided manufacturer warranties, or physical injury resulting from execution of procedures documented on this site.
              </li>
              <li>
                Always consult an authorized service technician, licensed automotive mechanic, or certified system administrator when dealing with hazardous or critical infrastructure failures.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-gray-700" />
              3. Intellectual Property & Fair Use Licensing
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              Except where otherwise noted, editorial diagnostic text created by ErrorCodeWiki is licensed under a Creative Commons Attribution-ShareAlike 4.0 License. All registered trademarks, brand names, product titles, and error code nomenclature (such as <em>Microsoft®, Windows®, Canon®, Epson®, Toyota®, PlayStation®, Cisco®</em>) belong to their respective trademark holders and are cited on ErrorCodeWiki strictly for nominative identification and diagnostic reference under Fair Use laws.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="font-serif text-xl font-bold text-gray-900 border-b border-gray-200 pb-1 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-gray-700" />
              4. Prohibited Uses
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              You agree not to engage in any of the following activities on the Site:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1.5">
              <li>Attempting to bypass security mechanisms or probe admin routes without authorization.</li>
              <li>Deploying denial-of-service (DoS) attacks or flooding search endpoints with spam automated scripts.</li>
              <li>Syndicating or re-selling whole database dumps without appropriate attribution or compliance with our <code>llms.txt</code> indexing standard.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3 pt-4 border-t border-gray-200">
            <h2 className="font-serif text-xl font-bold text-gray-900">
              5. Governing Law & Modifications
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed">
              ErrorCodeWiki reserves the right to update these Terms of Service at any time without prior notice. Continued use of the Site after changes are published constitutes acceptance of the modified terms. For legal inquiries or feedback, please visit our <Link href="/contact" className="text-blue-700 font-bold hover:underline">Contact Page</Link>.
            </p>
          </section>

        </article>
      </main>

      <Footer />
    </div>
  );
}
